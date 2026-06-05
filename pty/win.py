import asyncio
import shutil
import sys
from pathlib import Path
from .base import PtySession

if sys.platform == "win32":
    from winpty import PtyProcess as _WinPtyProcess


def _resolve_cmd(cmd: list[str]) -> list[str]:
    """Resolve the executable to its full absolute path, then wrap if necessary.

    Handles two common Claude CLI installation methods on Windows:
      1. npm global install -> claude.cmd shim (e.g. %APPDATA%\\npm\\claude.cmd)
         CreateProcess cannot execute .cmd directly; must go via cmd.exe /c.
      2. Standalone binary  -> claude.exe (downloaded or installed via winget/scoop)
         Can be handed to CreateProcess directly.

    Using the resolved absolute path avoids PATH-search ambiguity where
    CreateProcess may not see the full user PATH.
    """
    if not cmd:
        return cmd
    exe, *args = cmd

    # Accept an already-absolute path (user configured full path in claude_bin)
    p = Path(exe)
    if p.is_absolute():
        resolved = str(p)
    else:
        # Search PATH for the real file; shutil.which honours PATHEXT on Windows
        # so it finds claude.cmd, claude.exe, etc. in the correct priority order.
        resolved = shutil.which(exe)
        if resolved is None:
            return cmd  # not found -- let the OS surface the error naturally

    if Path(resolved).suffix.lower() in (".cmd", ".bat"):
        # .cmd/.bat must be interpreted by cmd.exe, not executed as a binary
        return ["cmd.exe", "/c", resolved] + args

    # Direct executable (.exe or no extension binary)
    return [resolved] + args


class WinPtySession(PtySession):
    def __init__(self, proc: "_WinPtyProcess") -> None:
        self._proc = proc

    @classmethod
    def create(cls, cmd: list[str], env: dict, cols: int, rows: int, cwd: str | None = None) -> "WinPtySession":
        resolved = _resolve_cmd(cmd)
        # Normalize cwd: strip trailing separator to avoid CreateProcess issues
        if cwd:
            cwd = cwd.rstrip("\\/")
        proc = _WinPtyProcess.spawn(
            resolved,
            cwd=cwd,
            env=env,
            dimensions=(rows, cols),
        )
        return cls(proc)

    async def read(self) -> bytes:
        loop = asyncio.get_event_loop()
        try:
            data = await loop.run_in_executor(None, self._proc.read, 4096)
        except EOFError:
            return b""
        if not data:
            return b""
        return data if isinstance(data, bytes) else data.encode("utf-8")

    def write(self, data: bytes) -> None:
        self._proc.write(data.decode("utf-8", errors="replace"))

    def set_size(self, cols: int, rows: int) -> None:
        self._proc.setwinsize(rows, cols)

    def kill(self) -> None:
        try:
            self._proc.terminate(force=True)
        except Exception:
            pass

    @property
    def pid(self) -> int:
        return self._proc.pid

    @property
    def exitstatus(self) -> int | None:
        try:
            return self._proc.exitstatus
        except Exception:
            return None
