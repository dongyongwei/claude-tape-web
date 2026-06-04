import asyncio
from collections import deque
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from pty.base import PtySession
    from fastapi import WebSocket


class _Entry:
    """Holds a running PTY session with its output buffer and attached WebSocket."""

    __slots__ = ("pty", "pid", "buffer", "_total", "buf_limit", "ws", "pump_task")

    def __init__(self, pty: "PtySession", buf_limit: int) -> None:
        self.pty = pty
        self.pid: int = getattr(pty, "pid", 0)
        self.buffer: deque[bytes] = deque()
        self._total: int = 0
        self.buf_limit = buf_limit
        self.ws: Optional["WebSocket"] = None
        self.pump_task: Optional[asyncio.Task] = None

    def append(self, chunk: bytes) -> None:
        self.buffer.append(chunk)
        self._total += len(chunk)
        while self._total > self.buf_limit:
            removed = self.buffer.popleft()
            self._total -= len(removed)

    def get_buffered(self) -> bytes:
        return b"".join(self.buffer)


class PtyManager:
    """App-level registry of live PTY sessions.

    PTY lifetime is decoupled from WebSocket lifetime: a session persists
    until the underlying process exits or is explicitly killed, regardless
    of how many times the WebSocket reconnects.
    """

    def __init__(self, buf_bytes: int = 200_000) -> None:
        self._entries: dict[str, _Entry] = {}
        self._buf_limit = buf_bytes

    def count(self) -> int:
        return len(self._entries)

    def register(self, sid: str, pty: "PtySession") -> _Entry:
        entry = _Entry(pty, self._buf_limit)
        self._entries[sid] = entry
        return entry

    def get(self, sid: str) -> Optional[_Entry]:
        return self._entries.get(sid)

    def remove(self, sid: str) -> Optional[_Entry]:
        return self._entries.pop(sid, None)

    def write(self, sid: str, data: bytes) -> None:
        entry = self._entries.get(sid)
        if entry:
            entry.pty.write(data)

    def resize(self, sid: str, cols: int, rows: int) -> None:
        entry = self._entries.get(sid)
        if entry:
            entry.pty.set_size(cols, rows)

    def kill(self, sid: str) -> None:
        entry = self._entries.pop(sid, None)
        if entry:
            if entry.pump_task:
                entry.pump_task.cancel()
            entry.pty.kill()

    def kill_all(self) -> None:
        for sid in list(self._entries.keys()):
            self.kill(sid)
