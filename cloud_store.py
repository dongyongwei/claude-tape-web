import json
import threading
from pathlib import Path

_lock = threading.Lock()

DEFAULT_BASE_URL = "https://py11.serv.qd-hyh-tech.com"
# 与 config.json / token 同目录，升级保留
CLOUD_FILE = Path.home() / ".agent_win_serve" / "cloud.json"


def load() -> dict:
    try:
        return json.loads(CLOUD_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def save(data: dict) -> None:
    CLOUD_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp = CLOUD_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(CLOUD_FILE)


def get_base_url() -> str:
    return (load().get("base_url") or DEFAULT_BASE_URL).rstrip("/")


def get_token() -> "str | None":
    return load().get("token") or None


def set_token(token: "str | None") -> None:
    with _lock:
        data = load()
        if token:
            data["token"] = token
        else:
            data.pop("token", None)
        save(data)


def set_base_url(base_url: str) -> None:
    with _lock:
        data = load()
        data["base_url"] = base_url.rstrip("/")
        save(data)
