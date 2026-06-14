import os
import sys
from urllib.parse import urlparse

from env_builder import build as build_env

# Special entries in the model dropdown: selecting one launches a plain shell
# instead of claude. These ids never appear in cfg.models — identified by prefix.
SHELL_CMD = "__shell_cmd__"
SHELL_POWERSHELL = "__shell_powershell__"
SHELL_DEFAULT = "__shell_default__"
SHELL_MODEL_IDS = (SHELL_CMD, SHELL_POWERSHELL, SHELL_DEFAULT)


def shell_argv(model_id: str | None) -> list[str] | None:
    """Special shell entry → argv that launches that shell. Returns None for any
    non-shell id (caller falls through to the claude path)."""
    win = sys.platform == "win32"
    if model_id == SHELL_CMD:
        return ["cmd.exe"] if win else ["/bin/sh"]
    if model_id == SHELL_POWERSHELL:
        return ["powershell.exe"] if win else ["pwsh"]
    if model_id == SHELL_DEFAULT:
        if win:
            return [os.environ.get("COMSPEC", "cmd.exe")]
        return [os.environ.get("SHELL", "/bin/sh")]
    return None


_SHELL_NAMES = {
    SHELL_CMD: "CMD",
    SHELL_POWERSHELL: "PowerShell",
    SHELL_DEFAULT: "Default shell",
}


def shell_display_name(model_id: str | None) -> str:
    """Friendly shell name used in the session list; empty string for non-shell ids."""
    return _SHELL_NAMES.get(model_id or "", "")


def _is_anthropic_base_url(url: str) -> bool:
    """True if the base_url points at Anthropic's official API (api.anthropic.com).

    Such a target (API key + official base_url) is genuine Claude: it validates
    thinking signatures exactly like the local-OAuth path, so it needs the same
    foreign-thinking cleanup on resume.
    """
    try:
        host = (urlparse(url).hostname or "").lower()
    except Exception:
        return False
    return host == "api.anthropic.com" or host.endswith(".anthropic.com")


def build_claude_command(
    base_cmd: list[str], sid: str, *, resume: str | None = None, cont: bool = False
) -> list[str]:
    """Decide the claude argv for a spawn.

    - resume given (UUID reactivate): --resume <id> restores that exact conversation.
    - cont (legacy reactivate): --continue, best-effort latest conversation.
    - fresh spawn with a UUID sid: --session-id <sid> pins the new conversation
      to this id, so a later reactivate can --resume it precisely.
    - fresh spawn with a legacy (non-UUID) sid: no extra flag (unchanged behavior).
    """
    cmd = list(base_cmd)
    if "--dangerously-skip-permissions" not in cmd:
        cmd.append("--dangerously-skip-permissions")
    if resume:
        cmd += ["--resume", str(resume)]
    elif cont:
        if "--continue" not in cmd:
            cmd.append("--continue")
    elif "-" in sid:
        cmd += ["--session-id", sid]
    return cmd


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


def is_claude_target(data: dict, models: list[dict] | None) -> bool:
    """True if this spawn targets genuine Claude (validates thinking signatures).

    Robust against inherited env: decided purely from the selected model_id and the
    configured model list. Genuine Claude = any of:
      * no model_id / unknown id  → built-in local-OAuth login
      * a configured model with no base_url → local credentials
      * a configured model whose base_url is Anthropic official (api.anthropic.com),
        e.g. API key + official base_url
    Only a configured model with a NON-Anthropic base_url (mimo etc.) is third-party
    and is left untouched (full delivery).
    """
    mid = data.get("model_id")
    if mid in SHELL_MODEL_IDS:
        return False  # plain shell session — no claude transcript to clean up
    if not mid:
        return True
    chosen = next((m for m in (models or []) if m.get("id") == mid), None)
    if not chosen:
        return True
    base = (chosen.get("base_url") or "").strip()
    if not base:
        return True
    return _is_anthropic_base_url(base)


def build_spawn(data: dict, claude_bin: str, sid: str,
                models: list[dict] | None = None):
    """Convert a browser spawn message into PTY start parameters.

    Returns (argv, env, cols, rows, cwd).
    If data["model_id"] matches a model entry, its env vars are injected.
    """
    cols = int(data.get("cols", 120))
    rows = int(data.get("rows", 30))
    cwd = data.get("cwd")
    shell = shell_argv(data.get("model_id"))
    if shell is not None:
        # Plain shell: skip every claude arg and the model env injection
        # (resume/continue are also ignored).
        env = build_env(None, cwd, cols, rows)
        return shell, env, cols, rows, cwd
    base = [claude_bin]
    argv = build_claude_command(
        base, sid,
        resume=data.get("resume"),
        cont=bool(data.get("continue")),
    )
    env = build_env(None, cwd, cols, rows)
    apply_model_env(env, models, data.get("model_id"))
    return argv, env, cols, rows, cwd
