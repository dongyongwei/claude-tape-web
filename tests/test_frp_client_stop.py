import threading
import time

from pyfrpc.client import Client, LoginError
from pyfrpc.config import ClientConfig, ProxyConf


def _cfg():
    return ClientConfig(
        server_addr="127.0.0.1", server_port=59999, token="x",
        proxies={"t": ProxyConf("t", "127.0.0.1", 8009, proxy_type="http", subdomain="sub")},
        dial_timeout=1, reconnect=True,
    )


def test_stop_breaks_reconnect_loop():
    # 端口 59999 无服务,_run_once 连接失败 → 进入重连等待;stop() 后 run() 必须返回
    c = Client(_cfg())
    done = threading.Event()

    def runner():
        c.run()
        done.set()

    threading.Thread(target=runner, daemon=True).start()
    time.sleep(0.3)
    c.stop()
    assert done.wait(timeout=5), "run() did not exit after stop()"


def test_login_error_does_not_systemexit():
    # LoginError 应被 run() 捕获并记录到 last_error,而非 raise SystemExit
    c = Client(_cfg())

    def boom(_sock):
        raise LoginError("denied")

    c._login = boom
    c.cfg.reconnect = False
    c._run_once = lambda: boom(None)  # 直接触发 LoginError 路径
    c.run()  # 不得抛 SystemExit
    assert c.last_error and "denied" in c.last_error
