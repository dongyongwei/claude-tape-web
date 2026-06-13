"""Registry of active terminal WebSocket connections.

Lets an admin access-token reset force-disconnect every connected client
(close code 4003 → client drops to the token gate and must re-authenticate).
"""


class ConnectionHub:
    def __init__(self) -> None:
        self._conns: set = set()

    def add(self, ws) -> None:
        self._conns.add(ws)

    def discard(self, ws) -> None:
        self._conns.discard(ws)

    def count(self) -> int:
        return len(self._conns)

    async def close_all(self, code: int = 4003) -> int:
        """Close all tracked connections; returns how many were closed."""
        conns = list(self._conns)
        self._conns.clear()
        for ws in conns:
            try:
                await ws.close(code=code)
            except Exception:
                pass
        return len(conns)
