import asyncio
import sys
from .base import PtySession

if sys.platform == "win32":
    from winpty import PtyProcess as _WinPtyProcess


class WinPtySession(PtySession):
    def __init__(self, proc: "_WinPtyProcess") -> None:
        self._proc = proc

    @classmethod
    def create(cls, cmd: list[str], env: dict, cols: int, rows: int, cwd: str | None = None) -> "WinPtySession":
        proc = _WinPtyProcess.spawn(
            cmd,
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
