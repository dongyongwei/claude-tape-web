import cloud_client


def test_device_start_and_poll(monkeypatch):
    calls = []

    def fake_request(method, url, token=None, payload=None, timeout=15):
        calls.append((method, url, token, payload))
        if url.endswith("/api/auth/device/start"):
            return 200, {"device_code": "dc", "user_code": "WDJX-1234",
                         "verification_uri_complete": "https://x/activate?code=WDJX-1234",
                         "interval": 3, "expires_in": 600}
        if url.endswith("/api/auth/device/poll"):
            return 200, {"status": "approved", "token": "ctw_live_t"}
        return 404, {"detail": "no"}

    monkeypatch.setattr(cloud_client, "_request", fake_request)

    st, body = cloud_client.device_start("https://x")
    assert st == 200 and body["user_code"] == "WDJX-1234"
    st, body = cloud_client.device_poll("https://x", "dc")
    assert body["status"] == "approved" and body["token"] == "ctw_live_t"
    # poll 把 device_code 放进了 payload
    assert ("POST", "https://x/api/auth/device/poll", None, {"device_code": "dc"}) in calls


def test_verify_token(monkeypatch):
    monkeypatch.setattr(cloud_client, "_request",
                        lambda m, u, token=None, payload=None, timeout=15: (200, []))
    assert cloud_client.verify_token("https://x", "tok") is True
    monkeypatch.setattr(cloud_client, "_request",
                        lambda m, u, token=None, payload=None, timeout=15: (401, {"detail": "x"}))
    assert cloud_client.verify_token("https://x", "tok") is False


def test_sync(monkeypatch):
    captured = {}

    def fake_request(method, url, token=None, payload=None, timeout=15):
        captured.update(method=method, url=url, token=token, payload=payload)
        return 200, {"session_id": 1, "version": 1, "changed": True,
                     "line_count": 5, "data_size": 100,
                     "used_bytes": 100, "quota_bytes": 1073741824}

    monkeypatch.setattr(cloud_client, "_request", fake_request)
    st, body = cloud_client.sync("https://x", "ctw_live_t", {"local_sid": "abc", "content": "..."})
    assert st == 200 and body["changed"] is True
    assert captured["method"] == "POST"
    assert captured["url"] == "https://x/api/cloud/sync"
    assert captured["token"] == "ctw_live_t"
    assert captured["payload"]["local_sid"] == "abc"
