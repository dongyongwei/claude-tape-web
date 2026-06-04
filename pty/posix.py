import asyncio
import sys
from .base import PtySession

if sys.platform != "win32":
    import ptyprocess


class PosixPtySession(PtySession):
    def __init__(self, proc: "ptyprocess.PtyProcess") -> None:
        self._proc = proc

    @classmethod
    def create(cls, cmd: list[str], env: dict, cols: int, rows: int, cwd: str | None = None) -> "PosixPtySession":
        proc = ptyprocess.PtyProcess.spawn(
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
            return data
        except EOFError:
            return b""

    def write(self, data: bytes) -> None:
        self._proc.write(data)

    def set_size(self, cols: int, rows: int) -> None:
        self._proc.setwinsize(rows, cols)

    def kill(self) -> None:
        self._proc.terminate(force=True)

    @property
    def pid(self) -> int:
        return self._proc.pid
