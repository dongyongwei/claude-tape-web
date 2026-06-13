"""frp token authentication.

privilege_key = hex(md5(token + str(timestamp)))
Corresponds to the Go-side pkg/util/util.GetAuthKey.
"""

import hashlib


def get_auth_key(token, timestamp):
    """Compute the privilege_key. timestamp is a second-level integer (a float is truncated to its integer decimal representation)."""
    h = hashlib.md5()
    h.update(token.encode("utf-8"))
    h.update(str(int(timestamp)).encode("utf-8"))
    return h.hexdigest()
