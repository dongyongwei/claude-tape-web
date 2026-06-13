"""Bearer-token auth helpers shared by the REST routers and the terminal WS.

The access token is carried in the `Authorization: Bearer <token>` header for all
REST/`fetch` calls. Browsers cannot set headers on `new WebSocket()`, so the WS
handshake carries it as the 2nd `Sec-WebSocket-Protocol` value: `["bearer", <token>]`.
Neither path ever puts the token in a URL (no query string, no address bar).
"""

from fastapi import Header, HTTPException


def extract_bearer(authorization: str) -> str:
    """Return the token from an `Authorization: Bearer <token>` header, else ""."""
    if authorization and authorization[:7].lower() == "bearer ":
        return authorization[7:].strip()
    return ""


def extract_ws_token(websocket) -> str:
    """Return the token carried in `Sec-WebSocket-Protocol: bearer, <token>`, else ""."""
    proto = websocket.headers.get("sec-websocket-protocol", "")
    parts = [p.strip() for p in proto.split(",") if p.strip()]
    if len(parts) >= 2 and parts[0].lower() == "bearer":
        return parts[1]
    return ""


def make_require_token(get_runtime):
    """Build a FastAPI dependency enforcing the Bearer token when one is configured.

    get_runtime() -> cfg (provides .access_token); resolved per-request for hot-reload.
    """

    def require_token(authorization: str = Header("")) -> None:
        cfg = get_runtime()
        if cfg.access_token and extract_bearer(authorization) != cfg.access_token:
            raise HTTPException(status_code=401, detail="invalid token")

    return require_token
