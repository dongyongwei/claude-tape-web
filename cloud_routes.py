import threading

from fastapi import APIRouter, Body, Depends, HTTPException, Query

import cloud_client
import cloud_store
import session_clean


def make_cloud_router(get_runtime, store=None):
    """get_runtime() -> cfg，用于 ?token= 鉴权（与 app.py 一致）。
    pending device_code 留在本地后端内存，不下发浏览器。"""
    router = APIRouter(prefix="/api/cloud")
    pending = {"device_code": None}
    _pending_lock = threading.Lock()

    def require_token(token: str = Query("")) -> None:
        cfg = get_runtime()
        if cfg.access_token and token != cfg.access_token:
            raise HTTPException(status_code=401, detail="invalid token")

    @router.get("/status", dependencies=[Depends(require_token)])
    def status():
        base = cloud_store.get_base_url()
        tok = cloud_store.get_token()
        bound = bool(tok) and cloud_client.verify_token(base, tok)
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
        st, body = cloud_client.device_start(base)
        if st != 200:
            raise HTTPException(status_code=502, detail=body.get("detail", "cloud error"))
        with _pending_lock:
            pending["device_code"] = body["device_code"]
        # 不下发 device_code，只给浏览器展示所需
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
            content = open(files[0], encoding="utf-8").read()
        except OSError as e:
            raise HTTPException(status_code=500, detail=f"read transcript failed: {e}")
        payload = {
            "project_cwd": rec.get("cwd", ""),
            "local_sid": sid,
            "content": content,
            "tag": rec.get("tag", ""),
            "model_id": rec.get("model_id", ""),
            "model_name": rec.get("model_name", ""),
            "cols": int(rec.get("cols", 120)),
            "rows": int(rec.get("rows", 30)),
        }
        base = cloud_store.get_base_url()
        st, body = cloud_client.sync(base, token, payload)
        if st != 200:
            raise HTTPException(status_code=502, detail=body.get("detail", "cloud sync failed"))
        return body

    return router
