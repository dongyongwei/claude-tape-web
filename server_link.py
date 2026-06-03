import asyncio
import hashlib
import json
import logging
import os
import platform
import sys
from pathlib import Path
from typing import Any

import websockets
from websockets.exceptions import ConnectionClosed

from env_builder import build as build_env
from pty import create as create_pty
from pty_manager import PtyManager

log = logging.getLogger(__name__)

PING_INTERVAL = 30
RECV_TIMEOUT = 90


def _get_machine_id() -> str:
    """Return SHA256 of the machine's hardware ID."""
    if sys.platform == "win32":
        import winreg
        key = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Cryptography",
        )
        raw, _ = winreg.QueryValueEx(key, "MachineGuid")
    elif sys.platform == "darwin":
        import subprocess
        out = subprocess.check_output(
            ["ioreg", "-rd1", "-c", "IOPlatformExpertDevice"], text=True
        )
        for line in out.splitlines():
            if "IOPlatformUUID" in line:
                raw = line.split('"')[-2]
                break
        else:
            raise RuntimeError("IOPlatformUUID not found")
    else:
        p = Path("/etc/machine-id")
        if not p.exists():
            p = Path("/var/lib/dbus/machine-id")
        raw = p.read_text().strip()
    return hashlib.sha256(raw.encode()).hexdigest()


def _load_commands(claude_bin: str) -> dict[str, list[str]]:
    """Load commands.json from repo root."""
    commands_file = Path(__file__).parent / "commands.json"
    if not commands_file.exists():
        return {}
    raw = json.loads(commands_file.read_text(encoding="utf-8"))
    result = {}
    for entry in raw:
        cmd_template = entry.get("command", "${CLAUDE_BIN}")
        cmd_str = cmd_template.replace("${CLAUDE_BIN}", claude_bin)
        result[entry["id"]] = cmd_str.split()
    return result


def build_claude_command(
    base_cmd: list[str], sid: str, *, resume: str | None = None, cont: bool = False
) -> list[str]:
    """Decide the claude argv for a spawn.

    - resume given (UUID reactivate): ``--resume <id>`` restores that exact conversation.
    - cont (legacy reactivate): ``--continue``, best-effort latest conversation.
    - fresh spawn with a UUID sid: ``--session-id <sid>`` pins the new conversation
      to this id, so a later reactivate can ``--resume`` it precisely.
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


async def run(server_url: str, agent_token: str, claude_bin: str, project_dirs: list[str] | None = None, third_party_models: list[dict] | None = None, state: "object | None" = None) -> None:
    """Connect to server, run the agent message loop."""
    fingerprint = _get_machine_id()
    commands = _load_commands(claude_bin)
    manager = PtyManager()
    active_sid: str | None = None

    ws_url = f"{server_url}/ws/agent?token={agent_token}"
    log.info("Connecting to %s", server_url)

    async with websockets.connect(ws_url) as ws:
        # Send register frame
        await ws.send(json.dumps({
            "type": "register",
            "hostname": platform.node(),
            "os": sys.platform,
            "arch": platform.machine(),
            "version": "1.0.0",
            "fingerprint": fingerprint,
            "project_dirs": project_dirs or [],
            "models": [m["model"] for m in (third_party_models or [])],
        }))

        # Receive registered ack — catch 4001 (token bound to another machine)
        try:
            ack_raw = await asyncio.wait_for(ws.recv(), timeout=10)
        except ConnectionClosed as exc:
            if exc.rcvd is not None and exc.rcvd.code == 4001:
                print(
                    "ERROR: Token is already bound to another machine.\n"
                    "Go to the Web UI, click Connect → Generate Token for this host,\n"
                    "then update the agent_win config with the new token and restart.",
                    file=sys.stderr,
                )
                sys.exit(1)
            raise
        ack = json.loads(ack_raw)
        if ack.get("type") != "registered":
            raise RuntimeError(f"Expected registered ack, got: {ack}")
        log.info("Registered as host_id=%s", ack.get("host_id"))
        if state is not None:
            state.host_id = ack.get("host_id")
            state.active_sessions = 0

        read_tasks: set[asyncio.Task] = set()

        async def read_loop(sid: str, session):
            nonlocal active_sid
            try:
                while True:
                    data = await session.read()
                    if not data:
                        break
                    await ws.send(data)  # binary frame
            except Exception as exc:
                log.warning("read_loop %s error: %s", sid, exc)
            finally:
                manager.remove(sid)
                if state is not None:
                    state.active_sessions = manager.count()
                if active_sid == sid:
                    active_sid = None
                try:
                    await ws.send(json.dumps({"type": "closed", "sid": sid}))
                except Exception:
                    pass

        while True:
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=RECV_TIMEOUT)
            except asyncio.TimeoutError:
                log.warning("No message for %ds, disconnecting", RECV_TIMEOUT)
                break
            except ConnectionClosed:
                break

            if isinstance(msg, bytes):
                continue

            try:
                data: dict[str, Any] = json.loads(msg)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")

            if msg_type == "ping":
                await ws.send(json.dumps({"type": "pong"}))

            elif msg_type == "spawn":
                sid = data["sid"]
                command_id = data.get("command_id", "ccp")
                cols = int(data.get("cols", 120))
                rows = int(data.get("rows", 30))
                cwd = data.get("cwd")
                cmd = build_claude_command(
                    commands.get(command_id, [claude_bin]), sid,
                    resume=data.get("resume"), cont=bool(data.get("continue")),
                )
                env = build_env(None, cwd, cols, rows)
                # Third-party models: inject ANTHROPIC_* env after build_env removes parent token
                if third_party_models:
                    for m in third_party_models:
                        if m.get("model") == command_id:
                            env["ANTHROPIC_BASE_URL"]   = m["base_url"]
                            env["ANTHROPIC_AUTH_TOKEN"] = m["auth_token"]
                            env["ANTHROPIC_MODEL"]      = m["model"]
                            break
                try:
                    session = create_pty(cmd, env, cols, rows, cwd)
                    manager.register(sid, session)
                    if state is not None:
                        state.active_sessions = manager.count()
                    active_sid = sid
                    task = asyncio.create_task(read_loop(sid, session))
                    read_tasks.add(task)
                    task.add_done_callback(read_tasks.discard)
                    await ws.send(json.dumps({
                        "type": "spawned",
                        "sid": sid,
                        "pid": session.pid,
                        "cwd": cwd or os.getcwd(),
                    }))
                except Exception as exc:
                    log.error("spawn failed: %s", exc)
                    await ws.send(json.dumps({"type": "spawn_error", "sid": sid, "error": str(exc)}))

            elif msg_type == "input":
                sid = data.get("sid", active_sid)
                raw = data.get("data", "")
                if sid:
                    manager.write(sid, raw.encode("utf-8") if isinstance(raw, str) else raw)

            elif msg_type == "resize":
                sid = data.get("sid", active_sid)
                if sid:
                    manager.resize(sid, int(data["cols"]), int(data["rows"]))

            elif msg_type == "close":
                sid = data.get("sid", active_sid)
                if sid:
                    manager.kill(sid)

    # Kill all active sessions so executor threads unblock and can exit cleanly
    manager.kill_all()
    if state is not None:
        state.active_sessions = 0
    if read_tasks:
        await asyncio.gather(*read_tasks, return_exceptions=True)

    log.info("Agent disconnected")
