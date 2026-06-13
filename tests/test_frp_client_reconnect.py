"""控制连接的「僵尸检测」：半开/静默连接必须被读超时判死并触发重连，
断线后陈旧的 proxy_status 必须清掉，否则上层管理器会一直谎报 online。"""

import socket
import threading
import time

from pyfrpc import wire, messages
from pyfrpc.client import Client
from pyfrpc.config import ClientConfig, ProxyConf


class FakeFrps:
    """极简假 frps：完成明文登录握手后，按 mode 决定后续行为。

    mode="silent" → 发完 LOGIN_RESP 后保持连接打开但永不再发任何字节
                    （模拟睡眠/断网后的半开黑洞连接）。
    mode="close"  → 发完 LOGIN_RESP 立刻关连接（模拟 frps 重启发 RST）。
    """

    def __init__(self, mode):
        self.mode = mode
        self.connections = 0
        self._held = []
        self._stop = threading.Event()
        self._sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self._sock.bind(("127.0.0.1", 0))
        self._sock.listen(5)
        self.port = self._sock.getsockname()[1]
        self._t = threading.Thread(target=self._serve, daemon=True)
        self._t.start()

    def _serve(self):
        while not self._stop.is_set():
            try:
                conn, _ = self._sock.accept()
            except OSError:
                return
            self.connections += 1
            try:
                wire.read_msg(conn)  # 明文登录
                wire.write_msg(conn, messages.LOGIN_RESP, {"run_id": "r", "error": ""})
            except OSError:
                self._safe_close(conn)
                continue
            if self.mode == "close":
                self._safe_close(conn)
            else:  # silent：保持打开，绝不再发字节
                self._held.append(conn)

    @staticmethod
    def _safe_close(conn):
        try:
            conn.close()
        except OSError:
            pass

    def stop(self):
        self._stop.set()
        self._safe_close(self._sock)
        for c in self._held:
            self._safe_close(c)


def _cfg(port, **kw):
    base = dict(
        server_addr="127.0.0.1", server_port=port, token="x",
        proxies={"p": ProxyConf("p", "127.0.0.1", 8009, proxy_type="http", subdomain="sub")},
        dial_timeout=1, reconnect=True,
    )
    base.update(kw)
    return ClientConfig(**base)


def test_silent_connection_triggers_reconnect():
    """半开静默连接：读超时到点后必须判死并重连（否则永久卡死成僵尸）。"""
    srv = FakeFrps("silent")
    c = Client(_cfg(srv.port, heartbeat_timeout=0.5))
    threading.Thread(target=c.run, daemon=True).start()

    deadline = time.time() + 8
    while time.time() < deadline and srv.connections < 2:
        time.sleep(0.05)

    c.stop()
    srv.stop()
    assert srv.connections >= 2, \
        f"静默连接应被读超时判死并重连，实际只建立了 {srv.connections} 条连接"


def test_disconnect_clears_stale_proxy_status():
    """断线后陈旧的 proxy_status 必须清空，否则管理器会一直读到 ok=True 谎报 online。"""
    srv = FakeFrps("close")
    c = Client(_cfg(srv.port, heartbeat_timeout=0.5, reconnect=False))
    # 预置一条「上线成功」的陈旧状态，模拟之前已 online。
    c.proxy_status = {"p": {"ok": True, "remote_addr": "x", "error": ""}}

    # 连接→登录→服务端立刻关；读/写都会因断连抛 OSError（真实 run() 会捕获），
    # 这里只关心无论哪条路径，_run_once 的 finally 都把陈旧状态清掉了。
    try:
        c._run_once()
    except OSError:
        pass

    assert c.proxy_status == {}, f"断线后未清陈旧状态：{c.proxy_status}"
    srv.stop()
