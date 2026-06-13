import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import frp_routes
import frp_store
from config import ServeConfig


class FakeManager:
    def __init__(self):
        self.state = "stopped"
        self.started_port = None

    def start(self, port):
        self.started_port = port
        self.state = "online"
        return {"state": "online", "public_url": "https://tape-abc123.example.com", "error": ""}

    def stop(self):
        self.state = "stopped"
        return {"state": "stopped", "public_url": "", "error": ""}

    def status(self):
        url = "https://tape-abc123.example.com" if self.state == "online" else ""
        return {"state": self.state, "public_url": url, "error": ""}


@pytest.fixture()
def ctx(monkeypatch, tmp_path):
    monkeypatch.setattr(frp_store, "FRP_FILE", tmp_path / "frp.json")
    cfg = ServeConfig(access_token="", port=8009)
    applied = {}
    fake = FakeManager()

    def apply_token(new):
        applied["token"] = new
        cfg.access_token = new

    app = FastAPI()
    app.include_router(frp_routes.make_frp_router(lambda: cfg, apply_token, manager=fake))
    return TestClient(app), cfg, applied, fake


def test_status_stopped(ctx):
    client, cfg, _, _ = ctx
    r = client.get("/api/frp/status")
    assert r.status_code == 200
    j = r.json()
    assert j["state"] == "stopped"
    assert j["settings"]["server_addr"] == ""


def test_start_uses_runtime_port_and_builds_urls(ctx):
    client, cfg, _, fake = ctx
    cfg.access_token = "secrettok"
    r = client.post("/api/frp/start", headers={"Authorization": "Bearer secrettok"})
    assert r.status_code == 200
    assert fake.started_port == 8009
    j = r.json()
    assert j["state"] == "online"
    # token is never embedded in URLs; PC + mobile (/m) are returned separately
    assert j["url"] == "https://tape-abc123.example.com"
    assert j["mobile_url"] == "https://tape-abc123.example.com/m"
    assert "token" not in j["url"] and "token" not in j["mobile_url"]


def test_stop(ctx):
    client, _, _, _ = ctx
    assert client.post("/api/frp/stop").json()["state"] == "stopped"


def test_settings_validation_and_persist(ctx):
    client, _, _, _ = ctx
    r = client.put("/api/frp/settings", json={"server_addr": "9.9.9.9", "server_port": "7000"})
    assert r.status_code == 200
    assert r.json()["settings"]["server_addr"] == "9.9.9.9"
    assert r.json()["settings"]["server_port"] == 7000


def test_token_refresh_applies_and_returns_bare_token(ctx):
    client, cfg, applied, fake = ctx
    fake.state = "online"
    r = client.post("/api/frp/token/refresh")
    assert r.status_code == 200
    j = r.json()
    assert applied["token"] == j["token"]          # apply_token 被调用
    assert j["token"] != ""
    # token is returned bare (no URL with token embedded)
    assert "share_url" not in j


def test_requires_token_when_set(ctx):
    client, cfg, _, _ = ctx
    cfg.access_token = "secrettok"
    assert client.get("/api/frp/status").status_code == 401
    assert client.get("/api/frp/status?token=secrettok").status_code == 401  # query no longer accepted
    r = client.get("/api/frp/status", headers={"Authorization": "Bearer secrettok"})
    assert r.status_code == 200


def test_app_wires_frp_router(monkeypatch, tmp_path):
    monkeypatch.setattr(frp_store, "FRP_FILE", tmp_path / "frp.json")
    import app as app_module
    application = app_module.create_app(cfg=ServeConfig(access_token="", port=8009))
    c = TestClient(application)
    r = c.get("/api/frp/status")
    assert r.status_code == 200
    assert r.json()["settings"]["subdomain_host"] == ""
