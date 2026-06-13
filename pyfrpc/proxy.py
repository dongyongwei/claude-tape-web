"""Work-connection handling: request a work connection, wait for StartWorkConn, bridge to the local service, and forward data bidirectionally."""

import socket
import threading
import time

from . import wire, messages
from .auth import get_auth_key

_BUF = 32 * 1024


def handle_work_connection(cfg, run_id, proxies, log):
    """Establish a work connection and bridge it to the corresponding local service. Each work connection runs in its own thread."""
    try:
        sock = socket.create_connection(
            (cfg.server_addr, cfg.server_port), timeout=cfg.dial_timeout
        )
    except OSError as exc:
        log.warning("work conn: dial server failed: %s", exc)
        return

    # Clear the dial timeout left over from create_connection: the work
    # connection needs to wait indefinitely in the server's connection pool
    # for StartWorkConn (which can take far longer than the dial timeout),
    # otherwise an idle wait of a few seconds would be misdiagnosed as a
    # timeout and the connection closed.
    sock.settimeout(None)

    try:
        msg = {"run_id": run_id}
        if cfg.auth_work_conns and cfg.token:
            ts = int(time.time())
            msg["timestamp"] = ts
            msg["privilege_key"] = get_auth_key(cfg.token, ts)
        wire.write_msg(sock, messages.NEW_WORK_CONN, msg)

        # Block waiting for StartWorkConn (before a user connects, the server
        # parks this connection in its connection pool).
        type_byte, payload = wire.read_msg(sock)
        if type_byte != messages.START_WORK_CONN:
            log.warning("work conn: expected StartWorkConn, got %r", type_byte)
            sock.close()
            return
        if payload.get("error"):
            log.warning("work conn: StartWorkConn error: %s", payload["error"])
            sock.close()
            return

        proxy_name = payload.get("proxy_name", "")
        pconf = proxies.get(proxy_name)
        if pconf is None:
            log.warning("work conn: unknown proxy %r in StartWorkConn", proxy_name)
            sock.close()
            return

        try:
            local = socket.create_connection(
                (pconf.local_ip, pconf.local_port), timeout=cfg.dial_timeout
            )
        except OSError as exc:
            log.warning("[%s] dial local %s:%d failed: %s",
                        proxy_name, pconf.local_ip, pconf.local_port, exc)
            sock.close()
            return

        log.info("[%s] bridged to %s:%d", proxy_name, pconf.local_ip, pconf.local_port)
        _bridge(sock, local)
    except (EOFError, OSError, ValueError) as exc:
        log.debug("work conn closed: %s", exc)
        try:
            sock.close()
        except OSError:
            pass


def _bridge(work, local):
    """Forward bytes bidirectionally between two sockets.

    When one direction hits EOF, perform a **half-close** on the other end
    (`shutdown(SHUT_WR)`, sending a FIN) to tell the peer "this direction has
    no more data", letting the peer cleanly finish reading everything that
    was sent. Never `close()` the whole socket right after writing the last
    chunk of data -- that triggers a TCP RST, discarding any data still
    sitting unread in the peer's receive buffer, which causes frps's reverse
    proxy to report "connection reset by peer" while reading the response
    body and truncates the HTTP response. Only close() once both directions
    have finished.
    """
    def pump(src, dst):
        try:
            while True:
                data = src.recv(_BUF)
                if not data:
                    break
                dst.sendall(data)
        except OSError:
            # Cannot finish gracefully on error: force-close both ends to
            # unblock any recv() that is blocked in the other direction.
            for s in (src, dst):
                try:
                    s.close()
                except OSError:
                    pass
            return
        # src hit a clean EOF: send dst a FIN, so the peer gets EOF only
        # after it has read all the data that was sent.
        try:
            dst.shutdown(socket.SHUT_WR)
        except OSError:
            pass

    t1 = threading.Thread(target=pump, args=(work, local), daemon=True)
    t2 = threading.Thread(target=pump, args=(local, work), daemon=True)
    t1.start()
    t2.start()
    t1.join()
    t2.join()
    for s in (work, local):
        try:
            s.close()
        except OSError:
            pass
