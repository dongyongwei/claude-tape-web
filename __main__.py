import socket
import sys

import uvicorn

from app import create_app
from config import ServeConfig, resolve_config_path
from token_store import TOKEN_FILE, generate_token, load_saved_token, save_token


def _lan_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def resolve_access_token(cfg: ServeConfig) -> str:
    """Determine the access token for this run.

    Priority: ACCESS_TOKEN env var > saved token > randomly generated.
    When generating randomly, prompt in an interactive terminal for customization and persistence.
    """
    if cfg.access_token:
        return cfg.access_token
    saved = load_saved_token()
    if saved:
        return saved

    token = generate_token()
    if not sys.stdin.isatty():
        # Non-interactive environment (e.g. service/redirect): use random token, banner will print it
        return token

    print()
    print("First run: a random access token has been generated:")
    print(f"    {token}")
    print("Press Enter to use this token, or type a custom token:")
    try:
        custom = input("  Custom token > ").strip()
    except EOFError:
        custom = ""
    if custom:
        token = custom
    try:
        ans = input("  Save permanently for future runs? [y/N] > ").strip().lower()
    except EOFError:
        ans = ""
    if ans == "y":
        save_token(token)
        print(f"  Saved to {TOKEN_FILE}")
    print()
    return token


def main() -> None:
    cfg = ServeConfig.load()
    cfg.access_token = resolve_access_token(cfg)
    # Keep the persisted token file in lockstep with the live token. config.json's
    # access_token wins in resolve_access_token, so the token file can otherwise drift
    # stale and hand out a token the server rejects (WS close 4003). Best-effort: never
    # let a write failure block startup.
    if cfg.access_token and load_saved_token() != cfg.access_token:
        try:
            save_token(cfg.access_token)
        except OSError:
            pass
    app = create_app(cfg)
    _cfg_path = resolve_config_path()
    cfg_hint = str(_cfg_path) if _cfg_path.exists() else f"{_cfg_path} (not created, using defaults)"
    lan = _lan_ip()
    print("=" * 56)
    print("  agent_win_serve started")
    print(f"  Local    : http://127.0.0.1:{cfg.port}")
    print(f"  LAN      : http://{lan}:{cfg.port}")
    if cfg.host == "0.0.0.0":
        print(f"  External : http://0.0.0.0:{cfg.port}  (all interfaces)")
    print(f"  Token    : {cfg.access_token}")
    print("  (enter this token in the browser to access)")
    print(f"  Config   : {cfg_hint}")
    print(f"  Dirs     : {len(cfg.project_dirs)} | Models: {len(cfg.models)}")
    print("=" * 56)
    uvicorn.run(
        app,
        host=cfg.host,
        port=cfg.port,
        log_level="info",
        # Disable uvicorn's built-in WS PING/PONG keepalive. Through the frp HTTP proxy,
        # WS *control* frames (PING/PONG) don't reliably round-trip, so uvicorn never sees
        # a PONG and kills every tunnelled session at ws_ping_interval+timeout (~40s).
        # Keepalive is instead done at the application layer with data frames (the term WS
        # answers the client's {"type":"ping"} with {"type":"pong"}), which frp forwards fine.
        ws_ping_interval=None,
        ws_ping_timeout=None,
    )


if __name__ == "__main__":
    main()
