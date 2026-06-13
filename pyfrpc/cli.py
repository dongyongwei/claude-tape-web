"""Command-line parsing and startup."""

import argparse
import logging

from .config import ProxyConf, ClientConfig
from .client import Client


def parse_tcp(spec):
    """Parse 'name:[local_ip:]local_port:remote_port'."""
    parts = spec.split(":")
    if len(parts) == 4:
        name, local_ip, local_port, remote_port = parts
    elif len(parts) == 3:
        name, local_port, remote_port = parts
        local_ip = "127.0.0.1"
    else:
        raise argparse.ArgumentTypeError(
            f"invalid --tcp {spec!r}, expected name:[local_ip:]local_port:remote_port")
    try:
        return ProxyConf(name, local_ip, int(local_port), int(remote_port))
    except ValueError:
        raise argparse.ArgumentTypeError(f"invalid port in --tcp {spec!r}")


def parse_http(spec):
    """Parse 'name:[local_ip:]local_port:subdomain'."""
    parts = spec.split(":")
    if len(parts) == 4:
        name, local_ip, local_port, subdomain = parts
    elif len(parts) == 3:
        name, local_port, subdomain = parts
        local_ip = "127.0.0.1"
    else:
        raise argparse.ArgumentTypeError(
            f"invalid --http {spec!r}, expected name:[local_ip:]local_port:subdomain")
    if not subdomain:
        raise argparse.ArgumentTypeError(f"empty subdomain in --http {spec!r}")
    try:
        return ProxyConf(name, local_ip, int(local_port),
                         proxy_type="http", subdomain=subdomain)
    except ValueError:
        raise argparse.ArgumentTypeError(f"invalid port in --http {spec!r}")


def build_parser():
    p = argparse.ArgumentParser(
        prog="pyfrpc", description="Pure Python frp client (TCP port forwarding + HTTP subdomains)")
    p.add_argument("--server-addr", required=True, help="frps server address")
    p.add_argument("--server-port", type=int, default=7000, help="frps port (default 7000)")
    p.add_argument("--token", default="", help="frps auth.token; omit for none")
    p.add_argument("--user", default="", help="optional username")
    p.add_argument("--tcp", action="append", default=[], metavar="SPEC",
                   help="name:[local_ip:]local_port:remote_port, repeatable")
    p.add_argument("--http", action="append", default=[], metavar="SPEC",
                   help="name:[local_ip:]local_port:subdomain, repeatable")
    p.add_argument("--pool-count", type=int, default=1, help="number of pre-warmed work connections (default 1)")
    p.add_argument("--heartbeat-interval", type=int, default=30, help="heartbeat interval in seconds (default 30)")
    p.add_argument("--no-reconnect", action="store_true", help="exit on disconnect instead of reconnecting")
    p.add_argument("--log-level", default="info",
                   choices=["debug", "info", "warning", "error"])
    return p


def build_config(argv):
    args = build_parser().parse_args(argv)
    if not args.tcp and not args.http:
        build_parser().error("at least one --tcp or --http is required")
    proxies = {}
    for spec in args.tcp:
        pconf = parse_tcp(spec)
        if pconf.name in proxies:
            build_parser().error(f"duplicate proxy name: {pconf.name}")
        proxies[pconf.name] = pconf
    for spec in args.http:
        pconf = parse_http(spec)
        if pconf.name in proxies:
            build_parser().error(f"duplicate proxy name: {pconf.name}")
        proxies[pconf.name] = pconf
    cfg = ClientConfig(
        server_addr=args.server_addr,
        server_port=args.server_port,
        token=args.token,
        user=args.user,
        proxies=proxies,
        pool_count=args.pool_count,
        heartbeat_interval=args.heartbeat_interval,
        reconnect=not args.no_reconnect,
    )
    cfg._log_level = args.log_level  # read by main
    return cfg


def main(argv=None):
    cfg = build_config(argv if argv is not None else None)
    logging.basicConfig(
        level=getattr(logging, cfg._log_level.upper()),
        format="%(asctime)s %(levelname)s %(message)s",
    )
    try:
        Client(cfg).run()
    except KeyboardInterrupt:
        return 0
    return 0
