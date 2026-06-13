# pyfrpc — Pure Python frp client (TCP + HTTP subdomain)

A reverse-proxy (port-forwarding) client that connects directly to an official
frps server, implemented entirely with the Python standard library. It does not
depend on any frp binary — this avoids the official `frpc.exe` being flagged and
killed by antivirus software based on known signatures.

## Scope
- Supports TCP proxies (port forwarding) and HTTP `subdomain` proxies (subdomain
  routing); UDP/HTTPS/STCP/XTCP are not supported.
- Single connection (no yamux multiplexing); **requires the server to set
  `transport.tcpMux = false`**.
- Does not perform transport-layer TLS; **requires the server to not enforce
  TLS** (`transport.tls.force` must remain the default `false`).

> **Control connection encryption**: the frp protocol forces the control
> connection to switch to **AES-128-CFB encryption** after a successful login
> (the key is derived from the token and cannot be disabled). This client
> implements that encryption layer in pure Python (`aes.py` / `crypto.py`),
> with no third-party dependencies. Work connections and tunneled data remain
> plaintext (consistent with the official frpc's default behavior).

## Minimal server-side (frps.toml) configuration
```toml
bindPort = 7000
auth.method = "token"
auth.token = "MY_TOKEN"
transport.tcpMux = false
# Leave transport.tls.force at its default of false (allows plaintext connections)
```

## Usage
```bash
python -m pyfrpc \
  --server-addr 1.2.3.4 --server-port 7000 \
  --token MY_TOKEN \
  --tcp web:127.0.0.1:80:6000 \
  --tcp ssh:22:6022
```

The `--tcp` format is `name:[local_ip:]local_port:remote_port`. If `local_ip` is
omitted it defaults to `127.0.0.1`. You can specify `--tcp` multiple times to
register multiple proxies.

### HTTP subdomain proxy

```bash
python -m pyfrpc \
  --server-addr 1.2.3.4 --server-port 7000 \
  --token MY_TOKEN \
  --http term1:127.0.0.1:8080:term1
```

The `--http` format is `name:[local_ip:]local_port:subdomain`, which exposes a
local HTTP service as `http(s)://<subdomain>.<subDomainHost>`. This requires the
server to be configured with `vhostHTTPPort` and `subDomainHost` (see
[`deploy/README.md`](../deploy/README.md) for details). `--http` can be repeated
and combined with `--tcp` (at least one of the two must be specified).

## Parameters
| Parameter | Description | Default |
|---|---|---|
| `--server-addr` | frps address (required) | — |
| `--server-port` | frps port | 7000 |
| `--token` | auth.token; omit for none | empty |
| `--user` | optional username | empty |
| `--tcp` | TCP proxy `name:[local_ip:]local_port:remote_port`, repeatable | — |
| `--http` | HTTP proxy `name:[local_ip:]local_port:subdomain`, repeatable | — |
| `--pool-count` | number of pre-warmed work connections | 1 |
| `--heartbeat-interval` | heartbeat interval in seconds | 30 |
| `--no-reconnect` | exit immediately on disconnect | no |
| `--log-level` | debug/info/warning/error | info |

## Testing
```bash
# All tests (integration tests require the Go toolchain)
python -m pytest tests/pyfrpc -v

# Unit tests only
python -m pytest tests/pyfrpc -v --ignore=tests/pyfrpc/test_integration.py
```

> Note: this tool is fundamentally a NAT-traversal/tunneling tool, and its
> behavior may still draw attention from behavior-based AV detection. Please
> use it only for legitimate purposes such as port forwarding on assets you own
> and are authorized to manage.
