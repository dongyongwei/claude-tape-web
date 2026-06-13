import json
import os
import re
import shutil
from dataclasses import dataclass, field
from pathlib import Path

# Config file location: user home dir, decoupled from the repo so upgrades preserve config.
# Override path with the SERVE_CONFIG env var.
CONFIG_FILE = Path.home() / ".agent_win_serve" / "config.json"
# config.json in the package dir (fallback location, handy for local dev; in .gitignore).
PKG_CONFIG_FILE = Path(__file__).parent / "config.json"


def resolve_config_path(env: dict | None = None) -> Path:
    """Resolve the config file to read: SERVE_CONFIG > user home > package dir > user home default."""
    env = os.environ if env is None else env
    if env.get("SERVE_CONFIG"):
        return Path(env["SERVE_CONFIG"])
    if CONFIG_FILE.exists():
        return CONFIG_FILE
    if PKG_CONFIG_FILE.exists():
        return PKG_CONFIG_FILE
    return CONFIG_FILE


def resolve_write_path(env: dict | None = None) -> Path:
    """Resolve the config write target: SERVE_CONFIG path > user home CONFIG_FILE. Never falls back to package dir."""
    env = os.environ if env is None else env
    if env.get("SERVE_CONFIG"):
        return Path(env["SERVE_CONFIG"])
    return CONFIG_FILE


def _registry_path_dirs() -> str:
    """Windows only: the authoritative PATH from the registry (user + system).

    A double-clicked / service-launched exe can carry a stale process PATH that
    predates a freshly installed claude (the running session hasn't picked up the
    new entry yet); the registry already has it. Covers every install method that
    registers on PATH -- npm, the native installer, winget, scoop -- generically,
    without hardcoding per-tool directories. Returns "" off Windows or on error.
    """
    if os.name != "nt":
        return ""
    import winreg

    parts: list[str] = []
    for root, sub in (
        (winreg.HKEY_CURRENT_USER, r"Environment"),
        (winreg.HKEY_LOCAL_MACHINE,
         r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
    ):
        try:
            with winreg.OpenKey(root, sub) as key:
                val, _ = winreg.QueryValueEx(key, "Path")
        except OSError:
            continue
        if val:
            parts.append(os.path.expandvars(val))  # expand %USERPROFILE% etc.
    return os.pathsep.join(parts)


def resolve_claude_bin(claude_bin: str | None, env: dict | None = None) -> str:
    """Resolve claude_bin to THIS machine's absolute path.

    The config value stays portable (often just "claude"); the absolute path
    differs per machine and must be found at runtime. A packaged exe launched from
    Explorer or as a service may not inherit the full / freshly-updated user PATH,
    so the lookup widens progressively instead of trusting only the process PATH.

    Order:
      1. Absolute path that exists here -> use as-is.
      2. Absolute path that does NOT exist (e.g. config copied from another
         machine) -> fall through and re-resolve by file name.
      3. shutil.which over the process PATH (honours PATHEXT on Windows: .cmd/.exe).
      4. shutil.which over the registry PATH (user + system) -- catches any
         installer that registered on PATH when the process PATH is stale.
      5. Probe common install dirs (~/.local/bin, %APPDATA%/npm) as a last resort.
      6. Give up: return the original value so the OS surfaces a clear error.
    """
    env = os.environ if env is None else env
    raw = (claude_bin or "claude").strip() or "claude"
    name = raw
    p = Path(raw)
    if p.is_absolute():
        if p.exists():
            return str(p)
        name = p.name  # stale absolute from another machine: retry by file name

    found = shutil.which(name, path=env.get("PATH"))
    if found:
        return found

    reg_path = _registry_path_dirs()
    if reg_path:
        found = shutil.which(name, path=reg_path)
        if found:
            return found

    stem = Path(name).stem or "claude"
    home = Path.home()
    appdata = env.get("APPDATA", "")
    candidates = [
        home / ".local" / "bin" / f"{stem}.exe",
        home / ".local" / "bin" / stem,
    ]
    if appdata:
        candidates += [
            Path(appdata) / "npm" / f"{stem}.cmd",
            Path(appdata) / "npm" / f"{stem}.ps1",
            Path(appdata) / "npm" / f"{stem}.exe",
        ]
    for c in candidates:
        if c.exists():
            return str(c)

    return raw


def save_config(path: Path, data: dict) -> None:
    """Write config dict to path: creates parent dirs, UTF-8 with indentation, preserves non-ASCII."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


# Dir list separator: ';' preferred, ',' also accepted.
_DIR_SEP = re.compile(r"[;,]")


def _split_dirs(raw) -> list[str]:
    """Normalize dirs config to a list. Accepts ';'/',' separated strings or a list."""
    if isinstance(raw, list):
        items = raw
    else:
        items = _DIR_SEP.split(str(raw or ""))
    return [p.strip() for p in items if str(p).strip()]


@dataclass
class ServeConfig:
    """Runtime configuration. Defaults to listening on all interfaces.

    Config priority (low to high): built-in defaults → config file → env vars.
    models come from config file only (too structured for env vars).
    """
    host: str = "0.0.0.0"
    port: int = 8009
    claude_bin: str = "claude"
    project_dirs: list[str] = field(default_factory=list)
    access_token: str = ""  # non-empty: clients send Authorization: Bearer <token> (WS: Sec-WebSocket-Protocol)
    # third-party model configs: [{id,name,base_url,auth_token,model,small_fast_model}]
    models: list[dict] = field(default_factory=list)

    @classmethod
    def from_env(cls, env: dict | None = None) -> "ServeConfig":
        """Build from env vars only (kept for backwards compatibility)."""
        env = os.environ if env is None else env
        return cls(
            host=env.get("SERVE_HOST", "0.0.0.0"),
            port=int(env.get("SERVE_PORT", "8009")),
            claude_bin=env.get("CLAUDE_BIN") or "claude",
            project_dirs=_split_dirs(env.get("PROJECT_DIRS", "")),
            access_token=env.get("ACCESS_TOKEN", ""),
        )

    @classmethod
    def from_dict(cls, raw: dict) -> "ServeConfig":
        """Build from a dict and normalize (validates port, normalizes project_dirs/models)."""
        return cls(
            host=raw.get("host", "0.0.0.0"),
            port=int(raw.get("port", 8009)),
            claude_bin=raw.get("claude_bin") or "claude",
            project_dirs=_split_dirs(raw.get("project_dirs", [])),
            access_token=raw.get("access_token") or "",
            models=cls._normalize_models(raw.get("models", [])),
        )

    def to_dict(self) -> dict:
        """Serialize to a JSON-serializable dict (includes secrets, for config page and disk writes)."""
        return {
            "host": self.host,
            "port": self.port,
            "claude_bin": self.claude_bin,
            "access_token": self.access_token,
            "project_dirs": list(self.project_dirs),
            "models": [dict(m) for m in self.models],
        }

    @classmethod
    def from_file(cls, path: Path | None = None) -> "ServeConfig | None":
        """Build from a JSON config file; returns None if the file does not exist."""
        path = path or CONFIG_FILE
        if not path.exists():
            return None
        return cls.from_dict(json.loads(path.read_text(encoding="utf-8")))

    @classmethod
    def load(cls, env: dict | None = None, config_path: Path | None = None) -> "ServeConfig":
        """Config file as base, env vars override scalar fields (host/port/claude_bin/project_dirs/access_token).

        models come from config file only. Config path honours the SERVE_CONFIG env var.
        """
        env = os.environ if env is None else env
        path = config_path or resolve_config_path(env)
        cfg = cls.from_file(path) or cls()

        if "SERVE_HOST" in env:
            cfg.host = env["SERVE_HOST"]
        if "SERVE_PORT" in env:
            cfg.port = int(env["SERVE_PORT"])
        if env.get("CLAUDE_BIN"):
            cfg.claude_bin = env["CLAUDE_BIN"]
        if "PROJECT_DIRS" in env:
            cfg.project_dirs = _split_dirs(env["PROJECT_DIRS"])
        if "ACCESS_TOKEN" in env:
            cfg.access_token = env["ACCESS_TOKEN"]
        return cfg

    @staticmethod
    def _normalize_models(raw) -> list[dict]:
        """Normalize the model list: ensure each entry has id/name with defaults; drop entries missing id."""
        out: list[dict] = []
        for i, m in enumerate(raw or []):
            if not isinstance(m, dict):
                continue
            mid = str(m.get("id") or f"model{i}").strip()
            if not mid:
                continue
            out.append({
                "id": mid,
                "name": m.get("name") or mid,
                "base_url": (m.get("base_url") or "").strip(),
                "auth_token": (m.get("auth_token") or "").strip(),
                "model": (m.get("model") or "").strip(),
                "small_fast_model": (m.get("small_fast_model") or "").strip(),
            })
        return out
