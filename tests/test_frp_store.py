import frp_store


def test_defaults(tmp_path, monkeypatch):
    monkeypatch.setattr(frp_store, "FRP_FILE", tmp_path / "frp.json")
    s = frp_store.get_settings()
    assert s["server_addr"] == ""
    assert s["server_port"] == 7000
    assert s["token"] == ""
    assert s["subdomain_host"] == ""
    assert s["subdomain"] == ""


def test_set_settings_merges_and_persists(tmp_path, monkeypatch):
    monkeypatch.setattr(frp_store, "FRP_FILE", tmp_path / "frp.json")
    frp_store.set_settings({"server_addr": "1.2.3.4", "server_port": "7000"})
    s = frp_store.get_settings()
    assert s["server_addr"] == "1.2.3.4"
    assert s["server_port"] == 7000          # 转 int
    assert s["subdomain_host"] == ""  # 未给的回落默认
    assert not (tmp_path / "frp.json.tmp").exists()  # 原子写不留 .tmp


def test_subdomain_generated_once(tmp_path, monkeypatch):
    monkeypatch.setattr(frp_store, "FRP_FILE", tmp_path / "frp.json")
    first = frp_store.get_or_create_subdomain()
    assert first.startswith("tape-") and len(first) == len("tape-") + 6
    second = frp_store.get_or_create_subdomain()
    assert second == first                   # 只生成一次
    assert frp_store.get_settings()["subdomain"] == first
