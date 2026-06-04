import os

_REMOVE_KEYS = {
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_AUTH_TOKEN",
    "ANTHROPIC_BETA",
}


def build(base_env: dict | None, cwd: str | None, cols: int, rows: int) -> dict:
    """Build the environment dict for a PTY spawn.

    Starts from base_env (or current process env), removes sensitive keys,
    sets terminal size variables.
    """
    env = dict(os.environ if base_env is None else base_env)
    for key in _REMOVE_KEYS:
        env.pop(key, None)
    env["TERM"] = "xterm-256color"
    env["COLUMNS"] = str(cols)
    env["LINES"] = str(rows)
    if cwd:
        env["PWD"] = cwd
    return env
