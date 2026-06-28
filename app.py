from dataclasses import replace
from pathlib import Path

from fastapi import Body, Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from auth import make_require_token
from config import ServeConfig, resolve_claude_bin, resolve_write_path, save_config
from pty_manager import PtyManager
from session_store import SessionStore
from cloud_routes import make_cloud_router
from conn_hub import ConnectionHub
from files_routes import make_files_router
from frp_routes import make_frp_router, auto_start_if_enabled
from term_ws import make_router
from token_store import clear_saved_token, generate_token, save_token

_STATIC = Path(__file__).parent / "static"


class _RevalidateStatic(StaticFiles):
    """StaticFiles that forces browser revalidation on every asset.

    Without an explicit Cache-Control, browsers apply heuristic caching and may
    serve a stale .js/.css from cache without revalidating — so after an upgrade
    a fresh (no-store) HTML page can pull an old cached script, leaving newly
    added handlers unbound (e.g. a visible button that "does nothing"). `no-cache`
    means "always revalidate"; the existing ETag still yields cheap 304s when the
    file is unchanged, so this costs a conditional request, not a full re-download.
    """

    def file_response(self, *args, **kwargs):
        resp = super().file_response(*args, **kwargs)
        resp.headers.setdefault("Cache-Control", "no-cache")
        return resp


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
    """Mutable runtime state holder: centralises cfg for hot-reload support."""

    def __init__(self, cfg: ServeConfig):
        # Resolve claude_bin to this machine's absolute path up front, so the config
        # page back-fills the real path and PTY spawns never depend on the launching
        # process's PATH (a double-clicked / service-launched exe often lacks it).
        self.cfg = replace(cfg, claude_bin=resolve_claude_bin(cfg.claude_bin))

    def apply(self, new_cfg: ServeConfig) -> bool:
        """Swap in new config.

        host/port cannot be rebound at runtime: sets restart_required on change,
        then swaps in a copy that preserves the current bound host/port (does not mutate new_cfg).
        Returns restart_required.
        """
        restart_required = (
            new_cfg.host != self.cfg.host or new_cfg.port != self.cfg.port
        )
        # swap in a copy to preserve the running host/port binding without mutating the caller's
        # new_cfg, and re-resolve claude_bin to this machine's absolute path.
        self.cfg = replace(
            new_cfg, host=self.cfg.host, port=self.cfg.port,
            claude_bin=resolve_claude_bin(new_cfg.claude_bin),
        )
        return restart_required


def create_app(cfg: ServeConfig | None = None, store: SessionStore | None = None) -> FastAPI:
    cfg = cfg or ServeConfig.from_env()
    store = store or SessionStore()
    pty_manager = PtyManager()
    hub = ConnectionHub()
    runtime = Runtime(cfg)

    app = FastAPI(title="agent_win_serve")

    # Bearer-token auth (Authorization header); reads runtime to support hot-reload.
    require_token = make_require_token(lambda: runtime.cfg)

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

    @app.post("/api/sessions/{sid}/close", dependencies=[Depends(require_token)])
    def api_close_session(sid: str):
        pty_manager.kill(sid)
        store.mark_closed(sid)
        return {"closed": True}

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

    app.include_router(make_router(lambda: runtime.cfg, store, pty_manager, hub))
    app.include_router(make_cloud_router(lambda: runtime.cfg, store))
    app.include_router(make_files_router(lambda: runtime.cfg))

    def _apply_token(new: str) -> None:
        runtime.cfg.access_token = new
        save_config(resolve_write_path(), runtime.cfg.to_dict())
        _sync_token_store(new)

    app.include_router(make_frp_router(lambda: runtime.cfg, _apply_token))

    @app.on_event("startup")
    def _auto_start_frp():
        """Resume frp tunnel if it was enabled before restart."""
        auto_start_if_enabled(lambda: runtime.cfg)

    @app.post("/api/token/reset", dependencies=[Depends(require_token)])
    async def api_reset_token():
        # Regenerate the access token, persist + hot-apply it, then force-disconnect
        # every active terminal (close 4003) so all clients must re-authenticate.
        new = generate_token()
        _apply_token(new)
        kicked = await hub.close_all()
        return {"token": new, "kicked": kicked}

    # no-store on the HTML entrypoints so a stale page is never served from
    # browser cache after an upgrade (static assets keep ETag revalidation).
    _NO_CACHE = {"Cache-Control": "no-store, must-revalidate"}

    @app.get("/")
    def index():
        return FileResponse(_STATIC / "index.html", headers=_NO_CACHE)

    @app.get("/m")
    def mobile_index():
        return FileResponse(_STATIC / "mobile.html", headers=_NO_CACHE)

    app.mount("/static", _RevalidateStatic(directory=_STATIC), name="static")
    return app
