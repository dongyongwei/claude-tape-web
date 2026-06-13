import threading
import time

from pyfrpc.client import Client
from pyfrpc.config import ClientConfig, ProxyConf
import frp_store

_MAX_RETRIES = 5


def _proxy_name(subdomain: str) -> str:
    """The proxy name is a global key on frps (not scoped per machine), so it must
    include this machine's subdomain to avoid name collisions with other devices/
    instances sharing the same frps."""
    return f"claude-{subdomain}"


class FrpManager:
    """Background manager for a single HTTP subdomain tunnel. Thread-safe."""

    def __init__(self):
        self._lock = threading.Lock()
        self._client = None
        self._thread = None
        self._state = "stopped"        # stopped | connecting | online | error
        self._public_url = ""
        self._error = ""
        self._watch = None
        self._local_port = 0
        self._retry_count = 0
        self._name = ""

    def start(self, local_port: int) -> dict:
        with self._lock:
            # Already connecting/online -> return idempotently; but "error" is not a
            # terminal state: clicking Start again must be able to self-heal.
            if self._thread and self._thread.is_alive() and self._state != "error":
                return self._status_unlocked()
            old_client, old_thread = self._client, self._thread
            self._client = self._thread = self._watch = None
        # Stop the stale/errored old client first, otherwise its background
        # reconnect will fight the new client over registering the same
        # proxy name (claude-tape), which by itself triggers "proxy already exists".
        if old_client:
            old_client.stop()
        if old_thread:
            old_thread.join(timeout=3)
        with self._lock:
            self._local_port = local_port
            self._retry_count = 0
            self._start_client_unlocked()
            return self._status_unlocked()

    def _start_client_unlocked(self):
        """Create the Client and start its background thread (caller holds the lock)."""
        s = frp_store.get_settings()
        sub = frp_store.get_or_create_subdomain()
        self._public_url = f"https://{sub}.{s['subdomain_host']}"
        self._name = _proxy_name(sub)
        cfg = ClientConfig(
            server_addr=s["server_addr"],
            server_port=int(s["server_port"]),
            token=s["token"],
            proxies={self._name: ProxyConf(
                self._name, "127.0.0.1", int(self._local_port),
                proxy_type="http", subdomain=sub)},
            reconnect=True,
        )
        self._client = Client(cfg)
        self._error = ""
        self._state = "connecting"
        self._thread = threading.Thread(target=self._client.run, daemon=True)
        self._thread.start()
        frp_store.set_enabled(True)
        self._watch = threading.Thread(target=self._watch_loop, daemon=True)
        self._watch.start()

    def _watch_loop(self):
        """Short-poll the client's status and drive the state machine forward.

        Status source priority:
        - proxy_status[name].ok                 -> online
        - proxy_status reports 'already exists' -> auto-retry (a stale proxy remains on frps)
        - proxy_status reports another error    -> terminal error state (config problem, stop the client)
        - no proxy_status but run thread still alive -> connecting (initial connect or reconnecting after a drop)
        - no proxy_status and run thread has exited  -> terminal error state (e.g. LoginError, not reconnectable)

        Key point: when the control connection drops, the client clears proxy_status
        and reconnects on its own in the background; at that point the run thread is
        still alive, so we must show "connecting" rather than treating last_error as
        terminal — otherwise the panel would either falsely report "online" or
        wrongly report "error".
        """
        client = self._client
        should_retry = False
        while client is not None:
            with self._lock:
                if self._client is not client:
                    return
                run_thread = self._thread
                ps = client.proxy_status.get(self._name)
                if ps and ps["ok"]:
                    self._state = "online"
                    self._retry_count = 0
                elif ps and "already exists" in ps.get("error", ""):
                    if self._retry_count < _MAX_RETRIES:
                        self._retry_count += 1
                        should_retry = True
                        break
                    self._state = "error"
                    self._error = ps["error"]
                    client.stop()
                    self._client = self._thread = self._watch = None
                    return
                elif ps:
                    # Registration rejected by the server (not "already exists"): config is invalid, terminal state.
                    self._state = "error"
                    self._error = ps.get("error", "")
                    client.stop()
                    self._client = self._thread = self._watch = None
                    return
                elif run_thread is not None and not run_thread.is_alive():
                    # run() has exited (LoginError or reconnect=False): not reconnectable, terminal state.
                    self._state = "error"
                    self._error = client.last_error or "connection ended"
                    self._client = self._thread = self._watch = None
                    return
                else:
                    # Not yet registered successfully, but the run thread is still running:
                    # initial connect or reconnecting after a drop.
                    self._state = "connecting"
                    self._error = ""
            time.sleep(0.2)

        if not should_retry:
            return

        # --- Auto-retry: a stale proxy remains on frps, stop the old one and start a new one ---
        retry_num = self._retry_count

        # 1. Stop the old client
        client.stop()
        old_thread = None
        with self._lock:
            if self._client is not client:
                return  # the user has already called start(), don't interfere
            old_thread = self._thread
            self._client = None
            self._thread = None
        if old_thread:
            old_thread.join(timeout=3)

        # 2. Wait for frps to clean up the stale proxy (increasing backoff, capped at 30s)
        wait_secs = min(10 * retry_num, 30)
        with self._lock:
            self._state = "connecting"
            self._error = ""
        for _ in range(int(wait_secs * 2)):
            with self._lock:
                if self._state == "stopped":
                    return  # the user called stop()
            time.sleep(0.5)

        # 3. Restart; _start_client_unlocked will spawn another watch thread to take
        #    over the new client. This watch thread ends here and must never
        #    recursively call itself again, otherwise two watch threads would end up
        #    watching the same client and fighting each other.
        with self._lock:
            if self._client is not None or self._state == "stopped":
                return
            self._start_client_unlocked()

    def stop(self) -> dict:
        with self._lock:
            client, thread = self._client, self._thread
            self._client = self._thread = self._watch = None
        if client:
            client.stop()
        if thread:
            thread.join(timeout=3)
        with self._lock:
            self._state = "stopped"
            self._error = ""
            frp_store.set_enabled(False)
            return self._status_unlocked()

    def status(self) -> dict:
        with self._lock:
            return self._status_unlocked()

    def _status_unlocked(self) -> dict:
        return {
            "state": self._state,
            "public_url": self._public_url if self._state == "online" else "",
            "error": self._error,
        }
