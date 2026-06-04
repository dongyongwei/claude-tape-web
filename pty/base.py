from abc import ABC, abstractmethod


class PtySession(ABC):

    @classmethod
    @abstractmethod
    def create(cls, cmd: list[str], env: dict, cols: int, rows: int, cwd: str | None = None) -> "PtySession":
        ...

    @abstractmethod
    async def read(self) -> bytes:
        """Read available output bytes. Returns b'' on EOF."""
        ...

    @abstractmethod
    def write(self, data: bytes) -> None:
        """Write bytes to the PTY stdin."""
        ...

    @abstractmethod
    def set_size(self, cols: int, rows: int) -> None:
        """Resize the PTY."""
        ...

    @abstractmethod
    def kill(self) -> None:
        """Terminate the child process."""
        ...

    @property
    @abstractmethod
    def pid(self) -> int:
        ...
