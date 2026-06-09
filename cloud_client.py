import http.client
import json
import urllib.error
import urllib.request


def _request(method, url, token=None, payload=None, timeout=15):
    """返回 (status:int, body:dict|list)。网络异常返回 (0, {"detail": ...})。"""
    try:
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
    except (TypeError, ValueError) as e:
        return 0, {"detail": f"payload serialization error: {e}"}
    headers = {"Content-Type": "application/json"} if data is not None else {}
    if token is not None:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read().decode("utf-8")
            return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"detail": raw}
    except (urllib.error.URLError, OSError, http.client.HTTPException) as e:
        return 0, {"detail": str(e)}


def device_start(base_url):
    return _request("POST", f"{base_url}/api/auth/device/start")


def device_poll(base_url, device_code):
    return _request("POST", f"{base_url}/api/auth/device/poll",
                    payload={"device_code": device_code})


def verify_token(base_url, token) -> bool:
    st, _ = _request("GET", f"{base_url}/api/cloud/tokens", token=token)
    return st == 200


def sync(base_url, token, payload):
    return _request("POST", f"{base_url}/api/cloud/sync", token=token, payload=payload)
