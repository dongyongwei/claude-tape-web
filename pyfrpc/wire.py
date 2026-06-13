"""frp v1 wire protocol encoding/decoding.

Frame format: [1-byte message type][8-byte big-endian signed int64 length N][N-byte JSON body].

Reads go straight through socket.recv, reading exactly the number of bytes
needed each time, and never over-read -- because on a work connection, a
StartWorkConn frame is immediately followed by raw tunnel data, and any
extra buffered read would swallow the first bytes of the tunnel stream.
"""

import json
import struct

# Matches golib msg/json's default cap, guarding against malicious/abnormal lengths.
MAX_MSG_LENGTH = 10240

_HEADER_LEN = 9  # 1-byte type + 8-byte length


def encode_msg(type_byte, payload):
    """Encode a (type byte, dict) pair into a single frame of bytes."""
    if not isinstance(type_byte, (bytes, bytearray)) or len(type_byte) != 1:
        raise ValueError("type_byte must be exactly one byte")
    body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return bytes(type_byte) + struct.pack(">q", len(body)) + body


def write_msg(sock, type_byte, payload):
    """Encode and send a complete frame over the socket."""
    sock.sendall(encode_msg(type_byte, payload))


def recv_exactly(sock, n):
    """Read exactly n bytes from the socket; raise EOFError if the connection closes. Reads only n bytes, never more."""
    if n == 0:
        return b""
    buf = bytearray()
    while len(buf) < n:
        chunk = sock.recv(n - len(buf))
        if not chunk:
            raise EOFError("connection closed while reading")
        buf.extend(chunk)
    return bytes(buf)


def read_msg(sock):
    """Read a single frame and return (type byte, dict)."""
    header = recv_exactly(sock, _HEADER_LEN)
    type_byte = header[0:1]
    (length,) = struct.unpack(">q", header[1:_HEADER_LEN])
    if length < 0 or length > MAX_MSG_LENGTH:
        raise ValueError(f"message length {length} out of range (max {MAX_MSG_LENGTH})")
    body = recv_exactly(sock, length)
    payload = json.loads(body.decode("utf-8")) if body else {}
    return type_byte, payload
