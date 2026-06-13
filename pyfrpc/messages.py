"""frp v1 wire protocol message type byte constants (subset used by this project)."""

LOGIN = b"o"            # C->S login
LOGIN_RESP = b"1"       # S->C login response
NEW_PROXY = b"p"        # C->S register proxy
NEW_PROXY_RESP = b"2"   # S->C register response
CLOSE_PROXY = b"c"      # C->S close proxy
NEW_WORK_CONN = b"w"    # C->S (on work connection) request a work connection
REQ_WORK_CONN = b"r"    # S->C (on control connection) request an additional work connection
START_WORK_CONN = b"s"  # S->C (on work connection) start forwarding
PING = b"h"             # C->S heartbeat
PONG = b"4"             # S->C heartbeat response
