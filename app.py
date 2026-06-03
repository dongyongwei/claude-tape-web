from dataclasses import replace
from pathlib import Path

from fastapi import Body, Depends, FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from commands import load_commands
from config import ServeConfig, resolve_write_path, save_config
from session_store import SessionStore
from term_ws import make_router
from token_store import clear_saved_token, save_token

_STATIC = Path(__file__).parent / "static"


def _sync_token_store(token: str) -> None:
    """Keep token_store in sync with the configured access_token.

    Non-empty: save it so resolve_access_token picks up the same token after restart.
    Empty: clear saved token to avoid a blank token being silently overridden on restart.
    """
    if token:
        save_token(token)
    else:
        clear_saved_token()


class Runtime:
    """Mutable runtime state holder: centralises cfg and argv_map for hot-reload support."""

    def __init__(self, cfg: ServeConfig, argv_map: dict):
        self.cfg = cfg
        self.argv_map = argv_map

    def apply(self, new_cfg: ServeConfig) -> bool:
        """Swap in new config. Recomputes argv_map if claude_bin changed.

        host/port cannot be rebound at runtime: sets restart_required on change,
        then swaps in a copy that preserves the current bound host/port (does not mutate new_cfg).
        Returns restart_required.
        """
        restart_required = (
            new_cfg.host != self.cfg.host or new_cfg.port != self.cfg.port
        )
        if new_cfg.claude_bin != self.cfg.claude_bin:
            self.argv_map, _ = load_commands(new_cfg.claude_bin)
        # swap in a copy to preserve the running host/port binding without mutating the caller's new_cfg
        self.cfg = replace(new_cfg, host=self.cfg.host, port=self.cfg.port)
        return restart_required


def create_app(cfg: ServeConfig | None = None, store: SessionStore | None = None) -> FastAPI:
    cfg = cfg or ServeConfig.from_env()
    store = store or SessionStore()
    argv_map, ui_list = load_commands(cfg.claude_bin)
    runtime = Runtime(cfg, argv_map)

    app = FastAPI(title="agent_win_serve")

    def require_token(token: str = Query("")) -> None:
        # if access_token is set, ?token= must match; reads runtime to support hot-reload
        if runtime.cfg.access_token and token != runtime.cfg.access_token:
            raise HTTPException(status_code=401, detail="invalid token")

    @app.get("/api/commands", dependencies=[Depends(require_token)])
    def api_commands():
        return ui_list

    @app.get("/api/project-dirs", dependencies=[Depends(require_token)])
    def api_project_dirs():
        return runtime.cfg.project_dirs

    @app.get("/api/models", dependencies=[Depends(require_token)])
    def api_models():
        # expose only id/name to the frontend; never leak auth_token or other secrets
        return [{"id": m["id"], "name": m["name"]} for m in runtime.cfg.models]

    @app.get("/api/sessions", dependencies=[Depends(require_token)])
    def api_sessions():
        return store.list_grouped()

    @app.patch("/api/sessions/{sid}", dependencies=[Depends(require_token)])
    def api_patch_session(sid: str, body: dict = Body(...)):
        ok = store.patch_session(sid, body)
        if not ok:
            raise HTTPException(status_code=404, detail="session not found")
        return {"updated": True}

    @app.delete("/api/sessions/{sid}", dependencies=[Depends(require_token)])
    def api_delete_session(sid: str):
        return {"deleted": store.delete(sid)}

    @app.get("/api/config", dependencies=[Depends(require_token)])
    def api_get_config():
        # Returns the full config including secrets (plaintext). Accessible only from the token-protected config page.
        # no file = defaults, so the config page works for first-time setup.
        return runtime.cfg.to_dict()

    @app.put("/api/config", dependencies=[Depends(require_token)])
    def api_put_config(body: dict = Body(...)):
        try:
            normalized = ServeConfig.from_dict(body)
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=400, detail=f"invalid config: {exc}")
        save_config(resolve_write_path(), normalized.to_dict())
        _sync_token_store(normalized.access_token)
        return {"saved": True}

    @app.post("/api/config/apply", dependencies=[Depends(require_token)])
    def api_apply_config(body: dict = Body(...)):
        try:
            normalized = ServeConfig.from_dict(body)
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=400, detail=f"invalid config: {exc}")
        save_config(resolve_write_path(), normalized.to_dict())
        _sync_token_store(normalized.access_token)
        restart = runtime.apply(normalized)
        return {"applied": True, "restart_required": restart}

    app.include_router(make_router(lambda: (runtime.cfg, runtime.argv_map), store))

    @app.get("/")
    def index():
        return FileResponse(_STATIC / "index.html")

    app.mount("/static", StaticFiles(directory=_STATIC), name="static")
    return app
