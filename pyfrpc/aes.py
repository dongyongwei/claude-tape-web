"""Pure-Python AES-128 + CFB128 stream cipher (zero third-party deps).

Implements only what the frp control connection needs: AES-128 block
encryption + CFB128 stream mode.
This CFB128 implementation is byte-for-byte compatible with the Go standard
library's `crypto/cipher` NewCFBEncrypter/Decrypter: the keystream is
generated block-by-block (16 bytes), XORed byte-by-byte, and the feedback
register is filled with the current block's ciphertext bytes.

Control-connection message volume is tiny, so pure-Python performance is
plenty (tunneled data does not pass through this layer).
"""

# AES S-box
_SBOX = bytes.fromhex(
    "637c777bf26b6fc53001672bfed7ab76"
    "ca82c97dfa5947f0add4a2af9ca472c0"
    "b7fd9326363ff7cc34a5e5f171d83115"
    "04c723c31896059a071280e2eb27b275"
    "09832c1a1b6e5aa0523bd6b329e32f84"
    "53d100ed20fcb15b6acbbe394a4c58cf"
    "d0efaafb434d338545f9027f503c9fa8"
    "51a3408f929d38f5bcb6da2110fff3d2"
    "cd0c13ec5f974417c4a77e3d645d1973"
    "60814fdc222a908846eeb814de5e0bdb"
    "e0323a0a4906245cc2d3ac629195e479"
    "e7c8376d8dd54ea96c56f4ea657aae08"
    "ba78252e1ca6b4c6e8dd741f4bbd8b8a"
    "703eb5664803f60e613557b986c11d9e"
    "e1f8981169d98e949b1e87e9ce5528df"
    "8ca1890dbfe6426841992d0fb054bb16"
)


def _xtime(a):
    """Multiply by 2 in GF(2^8)."""
    a <<= 1
    if a & 0x100:
        a ^= 0x11B
    return a & 0xFF


def _mul(a, b):
    """Multiplication in GF(2^8)."""
    p = 0
    for _ in range(8):
        if b & 1:
            p ^= a
        hi = a & 0x80
        a = (a << 1) & 0xFF
        if hi:
            a ^= 0x1B
        b >>= 1
    return p


class AES128:
    """AES-128 block cipher (encrypt_block only; CFB uses AES encryption in both directions)."""

    def __init__(self, key):
        if len(key) != 16:
            raise ValueError("AES-128 key must be 16 bytes")
        self._rk = self._expand_key(key)

    @staticmethod
    def _expand_key(key):
        ks = bytearray(key)  # 16 bytes, expanded to 176 bytes (11 round keys)
        rcon = 1
        while len(ks) < 176:
            t = bytearray(ks[-4:])
            if len(ks) % 16 == 0:
                t = bytearray([t[1], t[2], t[3], t[0]])      # RotWord
                t = bytearray(_SBOX[x] for x in t)           # SubWord
                t[0] ^= rcon                                 # Rcon
                rcon = _xtime(rcon)
            for j in range(4):
                ks.append(ks[-16] ^ t[j])
        return bytes(ks)

    def encrypt_block(self, block):
        s = bytearray(block)
        rk = self._rk
        # initial round key addition
        for i in range(16):
            s[i] ^= rk[i]
        for r in range(1, 10):
            self._sub_bytes(s)
            self._shift_rows(s)
            self._mix_columns(s)
            base = r * 16
            for i in range(16):
                s[i] ^= rk[base + i]
        # final round (no MixColumns)
        self._sub_bytes(s)
        self._shift_rows(s)
        for i in range(16):
            s[i] ^= rk[160 + i]
        return bytes(s)

    @staticmethod
    def _sub_bytes(s):
        for i in range(16):
            s[i] = _SBOX[s[i]]

    @staticmethod
    def _shift_rows(s):
        # state in column-major order: s[r + 4*c]
        s[1], s[5], s[9], s[13] = s[5], s[9], s[13], s[1]
        s[2], s[6], s[10], s[14] = s[10], s[14], s[2], s[6]
        s[3], s[7], s[11], s[15] = s[15], s[3], s[7], s[11]

    @staticmethod
    def _mix_columns(s):
        for c in range(4):
            i = 4 * c
            a0, a1, a2, a3 = s[i], s[i + 1], s[i + 2], s[i + 3]
            s[i] = _mul(a0, 2) ^ _mul(a1, 3) ^ a2 ^ a3
            s[i + 1] = a0 ^ _mul(a1, 2) ^ _mul(a2, 3) ^ a3
            s[i + 2] = a0 ^ a1 ^ _mul(a2, 2) ^ _mul(a3, 3)
            s[i + 3] = _mul(a0, 3) ^ a1 ^ a2 ^ _mul(a3, 2)


class CFB:
    """CFB128 stream (byte-for-byte compatible with Go's crypto/cipher CFB).

    Encrypts when decrypt=False, decrypts when True. State persists across
    multiple process() calls, so a continuous message stream can be
    encrypted/decrypted in chunks.
    """

    def __init__(self, aes, iv, decrypt):
        if len(iv) != 16:
            raise ValueError("IV must be 16 bytes")
        self._aes = aes
        self._next = bytearray(iv)   # feedback register
        self._out = bytearray(16)    # current keystream block
        self._used = 16              # the first byte triggers a refresh
        self._decrypt = decrypt

    def process(self, data):
        out = bytearray(len(data))
        nxt = self._next
        ks = self._out
        used = self._used
        dec = self._decrypt
        enc_block = self._aes.encrypt_block
        for i, b in enumerate(data):
            if used == 16:
                ks = bytearray(enc_block(bytes(nxt)))
                used = 0
            if dec:
                nxt[used] = b
            c = b ^ ks[used]
            out[i] = c
            if not dec:
                nxt[used] = c
            used += 1
        self._out = ks
        self._used = used
        return bytes(out)
