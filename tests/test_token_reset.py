import asyncio

import pytest
from fastapi.testclient import TestClient

from config import ServeConfig
import app as app_module
from conn_hub import ConnectionHub


def test_reset_changes_token_and_requires_old_token_to_authorize(monkeypatch, tmp_path):
    # Isolate token persistence to tmp so we don't touch the real ~/.agent_win_serve
    import token_store
    monkeypatch.setattr(token_store, "TOKEN_FILE", tmp_path / "token")
    # Avoid writing the real config.json on hot-apply
    monkeypatch.setattr(app_module, "save_config", lambda *a, **k: None)

    application = app_module.create_app(cfg=ServeConfig(access_token="oldtok", port=8009))
    c = TestClient(application)

    # Wrong/no token is rejected
    assert c.post("/api/token/reset").status_code == 401
    # Correct (old) token authorizes the reset (Bearer header)
    r = c.post("/api/token/reset", headers={"Authorization": "Bearer oldtok"})
    assert r.status_code == 200
    new = r.json()["token"]
    assert new and new != "oldtok"

    # Old token no longer works; the new one does
    assert c.get("/api/config", headers={"Authorization": "Bearer oldtok"}).status_code == 401
    assert c.get("/api/config", headers={"Authorization": f"Bearer {new}"}).status_code == 200


def test_hub_close_all_closes_tracked_connections():
    hub = ConnectionHub()

    class FakeWS:
        def __init__(self):
            self.closed_with = None

        async def close(self, code=1000):
            self.closed_with = code

    a, b = FakeWS(), FakeWS()
    hub.add(a)
    hub.add(b)
    assert hub.count() == 2

    kicked = asyncio.run(hub.close_all())
    assert kicked == 2
    assert a.closed_with == 4003 and b.closed_with == 4003
    assert hub.count() == 0
