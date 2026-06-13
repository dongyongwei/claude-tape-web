"""pyfrpc runtime configuration dataclasses."""

from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class ProxyConf:
    """A single proxy definition (tcp or http)."""
    name: str
    local_ip: str
    local_port: int
    remote_port: Optional[int] = None   # used for tcp
    proxy_type: str = "tcp"             # "tcp" | "http"
    subdomain: Optional[str] = None     # used for http


@dataclass
class ClientConfig:
    """Global client configuration."""
    server_addr: str
    server_port: int = 7000
    token: str = ""
    user: str = ""
    proxies: Dict[str, ProxyConf] = field(default_factory=dict)
    pool_count: int = 1
    heartbeat_interval: int = 30
    # Control connection read timeout: if no bytes (including PONG) are received
    # from the server for this long, the connection is considered dead and a
    # reconnect is triggered. Must be greater than heartbeat_interval so healthy
    # connections aren't killed by mistake. This is exactly how half-open/black-hole
    # connections (sleep, network loss, PPPoE re-dial) get detected -- without a
    # timeout, recv() would block forever and the connection would become a zombie.
    heartbeat_timeout: int = 90
    dial_timeout: int = 10
    reconnect: bool = True
    # By default frps auth.additionalScopes is empty, so heartbeats/work
    # connections don't carry an auth key.
    auth_heartbeats: bool = False
    auth_work_conns: bool = False
