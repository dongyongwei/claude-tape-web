from fastapi import APIRouter, Body, Depends

from auth import make_require_token
import frp_store
import token_store

# 默认单例 manager；测试可通过参数注入替身
from frp_manager import FrpManager

_default_manager = FrpManager()


def make_frp_router(get_runtime, apply_token, manager=None):
    """get_runtime() -> cfg（提供 .port/.access_token，与 app.py 一致）。
    apply_token(new) 把刷新后的 token 热应用到 Runtime 并落盘。"""
    router = APIRouter(prefix="/api/frp")
    mgr = manager or _default_manager

    require_token = make_require_token(get_runtime)

    def _full_status() -> dict:
        st = mgr.status()
        s = frp_store.get_settings()
        sub = s.get("subdomain", "")
        url = st.get("public_url") or (
            f"https://{sub}.{s['subdomain_host']}" if sub else "")
        # token is never embedded in a URL; the receiver enters it at the gate.
        # PC opens the bare URL; mobile opens the same URL under /m.
        return {
            "state": st["state"],
            "error": st.get("error", ""),
            "subdomain": sub,
            "url": url,
            "mobile_url": f"{url}/m" if url else "",
            "token": get_runtime().access_token,
            "settings": s,
        }

    @router.get("/status", dependencies=[Depends(require_token)])
    def status():
        return _full_status()

    @router.post("/start", dependencies=[Depends(require_token)])
    def start():
        mgr.start(get_runtime().port)
        return _full_status()

    @router.post("/stop", dependencies=[Depends(require_token)])
    def stop():
        mgr.stop()
        return _full_status()

    @router.put("/settings", dependencies=[Depends(require_token)])
    def settings(body: dict = Body(...)):
        frp_store.set_settings({
            k: body[k] for k in ("server_addr", "server_port", "token", "subdomain_host")
            if k in body
        })
        return _full_status()

    @router.post("/token/refresh", dependencies=[Depends(require_token)])
    def token_refresh():
        new = token_store.generate_token()
        token_store.save_token(new)
        apply_token(new)
        # token is shown/copied on its own (no URL embedding), so return the bare value.
        return {"token": new}

    return router


def auto_start_if_enabled(get_runtime):
    """If frp was enabled before restart, automatically resume the tunnel."""
    s = frp_store.get_settings()
    if s.get("enabled"):
        _default_manager.start(get_runtime().port)
