import pytest
from fastapi.testclient import TestClient

from config import ServeConfig
import app as app_module
import cloud_client
import cloud_store


@pytest.fixture()
def client(monkeypatch, tmp_path):
    # 隔离 cloud.json 到 tmp
    monkeypatch.setattr(cloud_store, "CLOUD_FILE", tmp_path / "cloud.json")
    # 无 access_token，免去 ?token=
    cfg = ServeConfig(access_token="")
    application = app_module.create_app(cfg=cfg)
    return TestClient(application)


def test_status_unbound(client, monkeypatch):
    r = client.get("/api/cloud/status")
    assert r.status_code == 200
    assert r.json()["configured"] is False and r.json()["bound"] is False


def test_device_flow_saves_token(client, monkeypatch):
    monkeypatch.setattr(cloud_client, "device_start",
        lambda base: (200, {"device_code": "dc", "user_code": "WX-1",
                            "verification_uri_complete": "https://x/activate?code=WX-1",
                            "interval": 1, "expires_in": 600}))
    # 第一次 poll pending，第二次 approved
    seq = iter([(200, {"status": "pending"}),
                (200, {"status": "approved", "token": "ctw_live_z"})])
    monkeypatch.setattr(cloud_client, "device_poll", lambda base, dc: next(seq))

    s = client.post("/api/cloud/device/start").json()
    assert s["user_code"] == "WX-1"
    assert client.post("/api/cloud/device/poll").json()["status"] == "pending"
    assert client.post("/api/cloud/device/poll").json()["status"] == "approved"
    assert cloud_store.get_token() == "ctw_live_z"

    # status 现在 bound（verify_token 打桩为 True）
    monkeypatch.setattr(cloud_client, "verify_token", lambda base, tok: True)
    assert client.get("/api/cloud/status").json()["bound"] is True

    # logout 清除
    client.post("/api/cloud/logout")
    assert cloud_store.get_token() is None


def test_poll_without_start(client):
    assert client.post("/api/cloud/device/poll").status_code == 400


def test_sync_session_reads_transcript_and_posts(monkeypatch, tmp_path):
    import session_clean, session_store, cloud_client

    # Create a local session record + transcript file
    sid = "550e8400-e29b-41d4-a716-446655440000"
    store = session_store.SessionStore(root=tmp_path / "sessions")
    store.record_spawn(sid, cwd="/home/u/proj", model_id="2", model_name="Kimi", cols=120, rows=30)
    # Rebuild app with this store
    from config import ServeConfig
    import app as app_module
    application = app_module.create_app(cfg=ServeConfig(access_token=""), store=store)
    from fastapi.testclient import TestClient
    c = TestClient(application)

    jf = tmp_path / f"{sid}.jsonl"
    jf.write_text('{"a":1}\n{"b":2}\n', encoding="utf-8")
    monkeypatch.setattr(session_clean, "find_session_files", lambda s: [str(jf)])
    # Bound token
    monkeypatch.setattr(cloud_store, "CLOUD_FILE", tmp_path / "cloud.json")
    cloud_store.set_token("ctw_live_z")

    captured = {}
    def fake_sync(base, token, payload):
        captured["token"] = token
        captured["payload"] = payload
        return 200, {"session_id": 1, "version": 1, "changed": True,
                     "line_count": 2, "data_size": 16,
                     "used_bytes": 16, "quota_bytes": 1073741824}
    monkeypatch.setattr(cloud_client, "sync", fake_sync)

    r = c.post(f"/api/cloud/sync/{sid}")
    assert r.status_code == 200 and r.json()["changed"] is True
    assert captured["token"] == "ctw_live_z"
    assert captured["payload"]["local_sid"] == sid
    assert captured["payload"]["project_cwd"] == "/home/u/proj"
    assert captured["payload"]["content"] == '{"a":1}\n{"b":2}\n'
    assert captured["payload"]["model_name"] == "Kimi"


def test_sync_session_unbound_401(monkeypatch, tmp_path):
    monkeypatch.setattr(cloud_store, "CLOUD_FILE", tmp_path / "cloud.json")  # no token
    from config import ServeConfig
    import app as app_module
    from fastapi.testclient import TestClient
    application = app_module.create_app(cfg=ServeConfig(access_token=""))
    c = TestClient(application)
    r = c.post("/api/cloud/sync/whatever")
    assert r.status_code == 400  # not bound
