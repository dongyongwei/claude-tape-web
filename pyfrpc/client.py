"""Control connection: login (plaintext), switch to AES encryption, register proxies,
heartbeat, read-loop dispatch, and reconnect on disconnect.

frp control protocol notes:
- The login request/response are plaintext; once login succeeds, the control
  connection immediately switches to AES-128-CFB encryption.
- After encryption is enabled, the server proactively sends ReqWorkConn (to fill
  the work connection pool) and replies with NewProxyResp for each NewProxy.
- Because of this, the control connection uses a single read loop that dispatches
  by message type (ReqWorkConn / NewProxyResp / Pong), rather than a strict
  "send one, read one" pattern.
- Work connections are separate plaintext connections (see proxy.handle_work_connection).
"""

import logging
import platform
import socket
import threading
import time

from . import wire, messages, proxy
from .auth import get_auth_key
from .crypto import CryptoConn, derive_key
from . import FRP_VERSION


class LoginError(Exception):
    """Login was rejected by the server."""


class Client:
    def __init__(self, cfg):
        self.cfg = cfg
        self.log = logging.getLogger("pyfrpc")
        self.run_id = ""
        self._ctl = None
        self._stopped = False
        self._sock = None
        self.last_error = ""
        self.proxy_status = {}   # name -> {"ok": bool, "remote_addr": str, "error": str}

    def stop(self):
        """Request a stop: disable reconnect and interrupt the blocking read loop."""
        self._stopped = True
        sock = self._sock
        if sock is not None:
            try:
                sock.close()
            except OSError:
                pass

    def run(self):
        """Main loop: connect -> login -> encrypt -> register -> read loop; reconnects
        on disconnect if enabled. Can be aborted via stop()."""
        backoff = 1
        while not self._stopped:
            try:
                self._run_once()
                backoff = 1
            except LoginError as exc:
                self.last_error = str(exc)
                self.log.error("login failed: %s", exc)
                return
            except (OSError, EOFError, ValueError) as exc:
                self.last_error = str(exc)
                self.log.warning("control connection error: %s", exc)

            if self._stopped or not self.cfg.reconnect:
                return
            self.log.info("reconnecting in %ds ...", backoff)
            time.sleep(backoff)
            backoff = min(backoff * 2, 30)

    def _run_once(self):
        sock = socket.create_connection(
            (self.cfg.server_addr, self.cfg.server_port), timeout=self.cfg.dial_timeout
        )
        # Use the dial timeout during login; once logged in, switch to
        # heartbeat_timeout as the read timeout.
        sock.settimeout(self.cfg.dial_timeout)
        self._sock = sock
        try:
            self._login(sock)  # plaintext login; sets self.run_id

            # Read timeout: a healthy connection receives at least one PONG every
            # heartbeat_interval seconds, so this won't trigger under normal
            # operation. A half-open/black-holed connection receives no bytes at
            # all, so once heartbeat_timeout elapses, socket.timeout is raised
            # -> the read loop exits -> run() reconnects. Without this timeout,
            # recv() would block forever and the client would become a zombie.
            sock.settimeout(self.cfg.heartbeat_timeout)

            # After a successful login, switch to AES-128-CFB encryption
            cc = CryptoConn(sock, derive_key(self.cfg.token))
            self._ctl = cc

            stop = threading.Event()
            reader = threading.Thread(target=self._read_loop, args=(cc, stop), daemon=True)
            reader.start()

            # Register proxies: send NewProxy; the responses are handled by the read loop
            for name, pconf in list(self.cfg.proxies.items()):
                msg = {"proxy_name": name, "proxy_type": pconf.proxy_type}
                if pconf.proxy_type == "tcp":
                    msg["remote_port"] = pconf.remote_port
                    self.log.info("[%s] registering tcp proxy -> remote_port %d",
                                  name, pconf.remote_port)
                else:  # "http"
                    msg["subdomain"] = pconf.subdomain
                    msg["locations"] = [""]
                    self.log.info("[%s] registering http proxy -> subdomain %s",
                                  name, pconf.subdomain)
                wire.write_msg(cc, messages.NEW_PROXY, msg)

            hb = threading.Thread(target=self._heartbeat, args=(cc, stop), daemon=True)
            hb.start()

            stop.wait()  # block until the read loop ends (control connection closed)
        finally:
            self._ctl = None
            # Connection is down: clear all proxy registration status so callers
            # don't keep reading a stale ok=True and falsely report "online".
            # On a successful reconnect, this is repopulated via NEW_PROXY_RESP.
            self.proxy_status.clear()
            try:
                sock.close()
            except OSError:
                pass

    def _login(self, sock):
        ts = int(time.time())
        msg = {
            "version": FRP_VERSION,
            "hostname": socket.gethostname(),
            "os": platform.system().lower(),
            "arch": platform.machine().lower(),
            "pool_count": self.cfg.pool_count,
        }
        if self.cfg.user:
            msg["user"] = self.cfg.user
        if self.cfg.token:
            msg["timestamp"] = ts
            msg["privilege_key"] = get_auth_key(self.cfg.token, ts)

        wire.write_msg(sock, messages.LOGIN, msg)
        type_byte, payload = wire.read_msg(sock)
        if type_byte != messages.LOGIN_RESP:
            raise LoginError(f"unexpected reply {type_byte!r} to login")
        if payload.get("error"):
            raise LoginError(payload["error"])
        self.run_id = payload.get("run_id", "")
        self.log.info("login success, run_id=%s", self.run_id)

    def _spawn_work_conn(self):
        threading.Thread(
            target=proxy.handle_work_connection,
            args=(self.cfg, self.run_id, self.cfg.proxies, self.log),
            daemon=True,
        ).start()

    def _heartbeat(self, cc, stop):
        while not stop.wait(self.cfg.heartbeat_interval):
            msg = {}
            if self.cfg.auth_heartbeats and self.cfg.token:
                ts = int(time.time())
                msg["timestamp"] = ts
                msg["privilege_key"] = get_auth_key(self.cfg.token, ts)
            try:
                wire.write_msg(cc, messages.PING, msg)
            except OSError:
                return

    def _read_loop(self, cc, stop):
        try:
            while True:
                type_byte, payload = wire.read_msg(cc)
                if type_byte == messages.REQ_WORK_CONN:
                    self._spawn_work_conn()
                elif type_byte == messages.NEW_PROXY_RESP:
                    name = payload.get("proxy_name", "")
                    if payload.get("error"):
                        self.proxy_status[name] = {"ok": False, "remote_addr": "", "error": payload["error"]}
                        self.log.warning("[%s] start proxy failed: %s", name, payload["error"])
                        # "proxy already exists" is transient (stale registration on
                        # the server after a restart); keep the config so a reconnect
                        # can re-register.  Only drop truly invalid proxy configs.
                        if "already exists" not in payload["error"]:
                            self.cfg.proxies.pop(name, None)
                    else:
                        self.proxy_status[name] = {"ok": True, "remote_addr": payload.get("remote_addr", ""), "error": ""}
                        self.log.info("[%s] proxy started, remote_addr=%s",
                                      name, payload.get("remote_addr", ""))
                elif type_byte == messages.PONG:
                    self.log.debug("pong")
                else:
                    self.log.debug("ignore control message %r", type_byte)
        except (OSError, EOFError, ValueError) as exc:
            self.log.warning("control connection closed: %s", exc)
        finally:
            stop.set()
