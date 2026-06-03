from env_builder import build as build_env
from server_link import build_claude_command


def apply_model_env(env: dict, models: list[dict] | None, model_id: str | None) -> None:
    """Inject selected third-party model config into the PTY environment.

    Only non-empty fields are written; if base_url/auth_token are absent (e.g. the
    built-in profile) nothing is set and the session uses claude's local login credentials.
    build_env strips inherited ANTHROPIC_* auth first, so the model selection fully
    controls credentials.
    """
    if not models or not model_id:
        return
    chosen = next((m for m in models if m.get("id") == model_id), None)
    if not chosen:
        return
    mapping = {
        "base_url": "ANTHROPIC_BASE_URL",
        "auth_token": "ANTHROPIC_AUTH_TOKEN",
        "model": "ANTHROPIC_MODEL",
        "small_fast_model": "ANTHROPIC_SMALL_FAST_MODEL",
    }
    for key, env_name in mapping.items():
        val = (chosen.get(key) or "").strip()
        if val:
            env[env_name] = val


def build_spawn(data: dict, argv_map: dict[str, list[str]], claude_bin: str, sid: str,
                models: list[dict] | None = None):
    """Convert a browser spawn message into PTY start parameters.

    Returns (argv, env, cols, rows, cwd).
    If data.model_id matches a model entry, its env vars are injected.
    """
    command_id = data.get("command_id", "ccp")
    cols = int(data.get("cols", 120))
    rows = int(data.get("rows", 30))
    cwd = data.get("cwd")
    base = argv_map.get(command_id, [claude_bin])
    argv = build_claude_command(
        base, sid,
        resume=data.get("resume"),
        cont=bool(data.get("continue")),
    )
    env = build_env(None, cwd, cols, rows)
    apply_model_env(env, models, data.get("model_id"))
    return argv, env, cols, rows, cwd
