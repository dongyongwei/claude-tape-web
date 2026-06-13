import json
import secrets
import threading
from pathlib import Path

_lock = threading.Lock()

# Same directory as config.json / token / cloud.json, preserved across upgrades
FRP_FILE = Path.home() / ".agent_win_serve" / "frp.json"

DEFAULTS = {
    "server_addr": "",
    "server_port": 7000,
    "token": "",
    "subdomain_host": "",
    "subdomain": "",
    "enabled": False,
}


def load() -> dict:
    try:
        return json.loads(FRP_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def save(data: dict) -> None:
    FRP_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp = FRP_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(FRP_FILE)


def get_settings() -> dict:
    """Merge default values with the saved values and return all fields."""
    return {**DEFAULTS, **load()}


def _coerce_int(v, default):
    try:
        return int(v)
    except (TypeError, ValueError):
        return default


def set_settings(partial: dict) -> dict:
    """Validate and merge the editable fields, then save and return the merged full settings."""
    with _lock:
        data = load()
        if "server_addr" in partial:
            data["server_addr"] = str(partial["server_addr"]).strip() or DEFAULTS["server_addr"]
        if "server_port" in partial:
            data["server_port"] = _coerce_int(partial["server_port"], DEFAULTS["server_port"])
        if "token" in partial:
            data["token"] = str(partial["token"]).strip() or DEFAULTS["token"]
        if "subdomain_host" in partial:
            data["subdomain_host"] = str(partial["subdomain_host"]).strip() or DEFAULTS["subdomain_host"]
        save(data)
        return {**DEFAULTS, **data}


def get_or_create_subdomain() -> str:
    """The subdomain is generated only once: if empty, generate "tape-<6 hex>" and save it; otherwise return it as-is."""
    with _lock:
        data = load()
        sub = (data.get("subdomain") or "").strip()
        if not sub:
            sub = "tape-" + secrets.token_hex(3)
            data["subdomain"] = sub
            save(data)
        return sub


def set_enabled(flag: bool) -> None:
    with _lock:
        data = load()
        data["enabled"] = bool(flag)
        save(data)
