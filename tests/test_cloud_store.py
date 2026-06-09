from pathlib import Path

import cloud_store


def test_roundtrip(tmp_path, monkeypatch):
    f = tmp_path / "cloud.json"
    monkeypatch.setattr(cloud_store, "CLOUD_FILE", f)

    assert cloud_store.get_token() is None
    assert cloud_store.get_base_url() == cloud_store.DEFAULT_BASE_URL

    cloud_store.set_base_url("https://example.com")
    cloud_store.set_token("ctw_live_abc")
    assert cloud_store.get_base_url() == "https://example.com"
    assert cloud_store.get_token() == "ctw_live_abc"

    cloud_store.set_token(None)            # 解绑
    assert cloud_store.get_token() is None
    # base_url 解绑后保留
    assert cloud_store.get_base_url() == "https://example.com"
