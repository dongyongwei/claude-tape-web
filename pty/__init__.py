import sys
from .base import PtySession

if sys.platform == "win32":
    from .win import WinPtySession as _Impl
else:
    from .posix import PosixPtySession as _Impl


def create(cmd: list[str], env: dict, cols: int, rows: int, cwd: str | None = None) -> PtySession:
    return _Impl.create(cmd, env, cols, rows, cwd)


__all__ = ["PtySession", "create"]
