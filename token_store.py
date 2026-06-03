import secrets
from pathlib import Path

# Token storage: user home dir, decoupled from the repo so upgrades don't lose tokens.
TOKEN_FILE = Path.home() / ".agent_win_serve" / "token"


def generate_token() -> str:
    """Generate a random URL-safe access token (~16 chars)."""
    return secrets.token_urlsafe(12)


def load_saved_token(path: Path | None = None) -> str | None:
    """Read the saved token; returns None if file is absent or empty."""
    path = path or TOKEN_FILE
    if not path.exists():
        return None
    token = path.read_text(encoding="utf-8").strip()
    return token or None


def save_token(token: str, path: Path | None = None) -> None:
    """Persist the token to disk (creates parent dirs as needed)."""
    path = path or TOKEN_FILE
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(token, encoding="utf-8")


def clear_saved_token(path: Path | None = None) -> None:
    """Remove the saved token file (no-op if absent)."""
    path = path or TOKEN_FILE
    path.unlink(missing_ok=True)
