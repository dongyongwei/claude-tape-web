import threading
import time as _time_mod

import frp_manager
import frp_store

# Capture the real sleep before any monkeypatching.
_REAL_SLEEP = _time_mod.sleep


class FakeClient:
    """替身：start() 起线程不做网络；按预设把 proxy_status 标记成功/失败。"""
    instances = []

    def __init__(self, cfg):
        self.cfg = cfg
        self.last_error = ""
        # 取注册的代理名，模拟成功
        name = next(iter(cfg.proxies))
        self.proxy_status = {name: {"ok": True, "remote_addr": "sub.tape.hyzhn.com", "error": ""}}
        self._stopped = False
        FakeClient.instances.append(self)

    def run(self):
        while not self._stopped:
            _REAL_SLEEP(0.02)

    def stop(self):
        self._stopped = True


class FakeClientStaleProxy(FakeClient):
    """替身：前 N 次 proxy_status 返回 'already exists' 错误，之后成功。"""
    fail_count = 0  # 类变量：还剩多少次失败

    def __init__(self, cfg):
        super().__init__(cfg)
        name = next(iter(cfg.proxies))
        if FakeClientStaleProxy.fail_count > 0:
            self.proxy_status = {name: {"ok": False, "remote_addr": "", "error": "proxy [claude-tape] already exists"}}
            FakeClientStaleProxy.fail_count -= 1


def _patch(monkeypatch, tmp_path, client_cls=FakeClient):
    monkeypatch.setattr(frp_store, "FRP_FILE", tmp_path / "frp.json")
    monkeypatch.setattr(frp_manager, "Client", client_cls)
    FakeClient.instances.clear()


def _fast_sleep(secs):
    """Replace time.sleep with very short real sleeps for retry tests."""
    _REAL_SLEEP(min(secs, 0.01))


def test_start_reaches_online(monkeypatch, tmp_path):
    _patch(monkeypatch, tmp_path)
    frp_store.set_settings({"subdomain_host": "example.com"})
    m = frp_manager.FrpManager()
    m.start(8009)
    for _ in range(50):
        if m.status()["state"] == "online":
            break
        _REAL_SLEEP(0.05)
    st = m.status()
    assert st["state"] == "online"
    assert st["public_url"].startswith("https://tape-")
    assert st["public_url"].endswith(".example.com")
    m.stop()
    assert m.status()["state"] == "stopped"


def test_proxy_name_unique_per_device(monkeypatch, tmp_path):
    """代理名须含本机子域名：固定名 'claude-tape' 在 frps 上是全局键，
    多机/多实例共用同一 frps 时会互相抢注 → 'already exists'。"""
    _patch(monkeypatch, tmp_path)
    m = frp_manager.FrpManager()
    m.start(8009)
    sub = frp_store.get_settings()["subdomain"]
    name = next(iter(FakeClient.instances[0].cfg.proxies))
    assert sub and sub in name, f"proxy name {name!r} 应包含子域名 {sub!r}"
    m.stop()


def test_start_idempotent(monkeypatch, tmp_path):
    _patch(monkeypatch, tmp_path)
    m = frp_manager.FrpManager()
    m.start(8009)
    m.start(8009)
    assert len(FakeClient.instances) == 1   # 第二次不另起
    m.stop()


def test_retry_on_stale_proxy(monkeypatch, tmp_path):
    """frps 上有残留 proxy → 'already exists' → 自动重试成功。"""
    FakeClientStaleProxy.fail_count = 2  # 前 2 次失败，第 3 次成功
    _patch(monkeypatch, tmp_path, client_cls=FakeClientStaleProxy)
    monkeypatch.setattr(_time_mod, "sleep", _fast_sleep)

    m = frp_manager.FrpManager()
    m.start(8009)

    for _ in range(200):
        if m.status()["state"] in ("online", "error"):
            break
        _REAL_SLEEP(0.05)

    st = m.status()
    assert st["state"] == "online", f"expected online, got {st}"
    assert len(FakeClient.instances) >= 3  # at least 3 clients created (2 fails + 1 success)
    m.stop()


def test_retry_exhausted_reports_error(monkeypatch, tmp_path):
    """所有重试都失败 → 最终报错。"""
    FakeClientStaleProxy.fail_count = 99  # 永远失败
    _patch(monkeypatch, tmp_path, client_cls=FakeClientStaleProxy)
    monkeypatch.setattr(_time_mod, "sleep", _fast_sleep)

    m = frp_manager.FrpManager()
    m.start(8009)

    for _ in range(200):
        if m.status()["state"] == "error":
            break
        _REAL_SLEEP(0.05)

    st = m.status()
    assert st["state"] == "error"
    assert "already exists" in st["error"]
    m.stop()


def test_retry_exhausted_stops_zombie_client(monkeypatch, tmp_path):
    """重试耗尽后，后台 client 必须被停掉，不能留着继续重连重注册代理。"""
    FakeClientStaleProxy.fail_count = 99  # 永远失败
    _patch(monkeypatch, tmp_path, client_cls=FakeClientStaleProxy)
    monkeypatch.setattr(_time_mod, "sleep", _fast_sleep)

    m = frp_manager.FrpManager()
    m.start(8009)

    for _ in range(200):
        if m.status()["state"] == "error":
            break
        _REAL_SLEEP(0.05)
    assert m.status()["state"] == "error"

    # 所有创建过的 client 都应已停止（_stopped=True），不留僵尸后台线程。
    _REAL_SLEEP(0.1)
    assert all(c._stopped for c in FakeClient.instances), \
        "errored 后仍有 client 在后台运行，会持续重注册 claude-tape"
    m.stop()


class FakeClientThenDrops(FakeClient):
    """替身：先 ok=True 上线，0.3s 后把 proxy_status 清空并置 last_error，
    模拟控制连接断开后 client 正在后台重连（run 线程仍存活）。"""

    def __init__(self, cfg):
        super().__init__(cfg)

        def _drop():
            _REAL_SLEEP(0.3)
            self.proxy_status.clear()
            self.last_error = "control connection error: timed out"

        threading.Thread(target=_drop, daemon=True).start()


class FakeClientDies(FakeClient):
    """替身：run() 立刻退出（模拟 LoginError 不可重连），proxy_status 为空、last_error 已置。"""

    def __init__(self, cfg):
        self.cfg = cfg
        self.last_error = "login failed: denied"
        self.proxy_status = {}
        self._stopped = False
        FakeClient.instances.append(self)

    def run(self):
        return


def test_link_drop_does_not_stay_online(monkeypatch, tmp_path):
    """控制连接断开（proxy_status 被清、last_error 置位）但 run 线程仍在重连时，
    面板不能继续谎报 online，也不能误判为终态 error，应显示 connecting。"""
    _patch(monkeypatch, tmp_path, client_cls=FakeClientThenDrops)
    m = frp_manager.FrpManager()
    m.start(8009)

    for _ in range(60):
        if m.status()["state"] == "online":
            break
        _REAL_SLEEP(0.05)
    assert m.status()["state"] == "online", "应先上线"

    for _ in range(100):
        if m.status()["state"] != "online":
            break
        _REAL_SLEEP(0.05)

    st = m.status()
    assert st["state"] == "connecting", f"断链后应显示 connecting（重连中），实际 {st}"
    assert st["public_url"] == "", "非 online 状态不应再暴露 public_url"
    m.stop()


def test_login_failure_reports_error(monkeypatch, tmp_path):
    """run 线程已退出且无代理注册 → 终态 error，带上 last_error。"""
    _patch(monkeypatch, tmp_path, client_cls=FakeClientDies)
    m = frp_manager.FrpManager()
    m.start(8009)

    for _ in range(60):
        if m.status()["state"] == "error":
            break
        _REAL_SLEEP(0.05)

    st = m.status()
    assert st["state"] == "error"
    assert "denied" in st["error"]
    m.stop()


def test_start_recovers_from_error(monkeypatch, tmp_path):
    """error 死胡同自愈：残留 proxy 清掉后，再点 Start 应起新 client 并上线。"""
    FakeClientStaleProxy.fail_count = 99  # 先把首轮打到 error
    _patch(monkeypatch, tmp_path, client_cls=FakeClientStaleProxy)
    monkeypatch.setattr(_time_mod, "sleep", _fast_sleep)

    m = frp_manager.FrpManager()
    m.start(8009)
    for _ in range(200):
        if m.status()["state"] == "error":
            break
        _REAL_SLEEP(0.05)
    assert m.status()["state"] == "error"

    # frps 上的残留 proxy 已被回收；用户再次点 Start。
    FakeClientStaleProxy.fail_count = 0
    n_before = len(FakeClient.instances)
    m.start(8009)
    for _ in range(200):
        if m.status()["state"] == "online":
            break
        _REAL_SLEEP(0.05)

    assert m.status()["state"] == "online", m.status()
    assert len(FakeClient.instances) > n_before, "应起一个全新 client"
    m.stop()
