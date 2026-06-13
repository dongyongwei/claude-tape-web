"""frp control-connection encryption layer (AES-128-CFB, zero third-party deps).

frp protocol: after the (plaintext) login succeeds, the control connection
immediately switches to AES-128-CFB encryption.
- key = pbkdf2_hmac(sha1, token, salt="frp", iterations=64, dklen=16)
  (matches the default derivation in the Go-side golib/crypto, with the salt
  fixed by frp to "frp")
- before its first send, the sender writes a 16-byte random IV; before its
  first receive, the receiver reads a 16-byte IV
- after that, each direction maintains its own independent CFB128 stream
"""

import hashlib
import os

from .aes import AES128, CFB


def derive_key(token):
    """Derive a 16-byte AES key from a token (an empty token is fine too, for auth=none)."""
    return hashlib.pbkdf2_hmac("sha1", token.encode("utf-8"), b"frp", 64, dklen=16)


class CryptoConn:
    """Wraps a plaintext socket with the AES-128-CFB encryption layer used by frp control connections.

    Provides recv()/sendall()/close(), compatible with wire.read_msg / wire.write_msg.
    """

    def __init__(self, sock, key):
        self._sock = sock
        self._key = key
        self._enc = None
        self._dec = None

    def _ensure_enc(self):
        if self._enc is None:
            iv = os.urandom(16)
            self._sock.sendall(iv)
            self._enc = CFB(AES128(self._key), iv, decrypt=False)

    def _ensure_dec(self):
        if self._dec is None:
            iv = self._recv_exact_raw(16)
            self._dec = CFB(AES128(self._key), iv, decrypt=True)

    def _recv_exact_raw(self, n):
        buf = bytearray()
        while len(buf) < n:
            chunk = self._sock.recv(n - len(buf))
            if not chunk:
                raise EOFError("connection closed while reading IV")
            buf.extend(chunk)
        return bytes(buf)

    def sendall(self, data):
        self._ensure_enc()
        self._sock.sendall(self._enc.process(data))

    def recv(self, bufsize):
        self._ensure_dec()
        raw = self._sock.recv(bufsize)
        if not raw:
            return b""
        return self._dec.process(raw)

    def close(self):
        self._sock.close()
