import threading

from fastapi import APIRouter, Body, Depends, HTTPException

from auth import make_require_token
import cloud_client
import cloud_store
import session_clean


def _safe_int(v, default):
    try:
        return int(v)
    except (TypeError, ValueError):
        return default


def make_cloud_router(get_runtime, store=None):
    """get_runtime() -> cfg, used for Bearer authentication (consistent with app.py).
    The pending device_code stays in the local backend's memory and is never sent to the browser."""
    router = APIRouter(prefix="/api/cloud")
    pending = {"device_code": None}
    _pending_lock = threading.Lock()

    require_token = make_require_token(get_runtime)

    @router.get("/status", dependencies=[Depends(require_token)])
    def status():
        base = cloud_store.get_base_url()
        tok = cloud_store.get_token()
        bound = bool(tok) and bool(base) and cloud_client.verify_token(base, tok)
        return {"configured": bool(tok), "bound": bound, "base_url": base}

    @router.put("/base-url", dependencies=[Depends(require_token)])
    def set_base_url(body: dict = Body(...)):
        url = str(body.get("base_url") or "").strip()
        if not url.startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="invalid base_url")
        cloud_store.set_base_url(url)
        return {"base_url": cloud_store.get_base_url()}

    @router.post("/device/start", dependencies=[Depends(require_token)])
    def device_start():
        base = cloud_store.get_base_url()
        if not base:
            raise HTTPException(status_code=400, detail="cloud server not configured")
        st, body = cloud_client.device_start(base)
        if st != 200:
            raise HTTPException(status_code=502, detail=body.get("detail", "cloud error"))
        with _pending_lock:
            pending["device_code"] = body["device_code"]
        # Do not send the device_code to the browser; only return what's needed for display
        return {
            "user_code": body["user_code"],
            "verification_uri_complete": body.get("verification_uri_complete", ""),
            "interval": body.get("interval", 3),
            "expires_in": body.get("expires_in", 600),
        }

    @router.post("/device/poll", dependencies=[Depends(require_token)])
    def device_poll():
        with _pending_lock:
            dc = pending.get("device_code")
        if not dc:
            raise HTTPException(status_code=400, detail="no pending authorization")
        base = cloud_store.get_base_url()
        st, body = cloud_client.device_poll(base, dc)
        if st != 200:
            return {"status": "error", "detail": body.get("detail", "")}
        if body.get("status") == "approved" and body.get("token"):
            cloud_store.set_token(body["token"])
            with _pending_lock:
                pending["device_code"] = None
            return {"status": "approved"}
        return {"status": body.get("status", "pending")}

    @router.post("/logout", dependencies=[Depends(require_token)])
    def logout():
        cloud_store.set_token(None)
        with _pending_lock:
            pending["device_code"] = None
        return {"ok": True}

    @router.post("/sync/{sid}", dependencies=[Depends(require_token)])
    def sync_session(sid: str):
        if store is None:
            raise HTTPException(status_code=503, detail="session store unavailable")
        token = cloud_store.get_token()
        if not token:
            raise HTTPException(status_code=400, detail="cloud not connected")
        rec = store.get(sid)
        if not rec:
            raise HTTPException(status_code=404, detail="session not found")
        files = session_clean.find_session_files(sid)
        if not files:
            raise HTTPException(status_code=404, detail="transcript not found")
        try:
            with open(files[0], encoding="utf-8") as fh:
                content = fh.read()
        except OSError as e:
            raise HTTPException(status_code=500, detail=f"read transcript failed: {e}")
        payload = {
            "project_cwd": rec.get("cwd", ""),
            "local_sid": sid,
            "content": content,
            "tag": rec.get("tag", ""),
            "model_id": rec.get("model_id", ""),
            "model_name": rec.get("model_name", ""),
            "cols": _safe_int(rec.get("cols"), 120),
            "rows": _safe_int(rec.get("rows"), 30),
        }
        base = cloud_store.get_base_url()
        st, body = cloud_client.sync(base, token, payload)
        if st != 200:
            raise HTTPException(status_code=502, detail=body.get("detail", "cloud sync failed"))
        return body

    return router
