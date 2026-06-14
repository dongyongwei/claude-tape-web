import asyncio
import json
import logging
import os
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from auth import extract_ws_token
from pty import create as create_pty
from pty_manager import PtyManager

from session_store import SessionStore
from spawn import build_spawn, is_claude_target, shell_display_name
from session_clean import clean_for_claude

log = logging.getLogger("term")

RECV_TIMEOUT = 300


def make_router(get_runtime, store: SessionStore, pty_manager: PtyManager, hub=None) -> APIRouter:
    """get_runtime() -> config, lazily resolved at connection time for testability.

    hub (optional ConnectionHub): tracks active connections so an admin token
    reset can force-disconnect every client.
    """
    router = APIRouter()

    @router.websocket("/ws/term")
    async def term_ws(websocket: WebSocket):
        cfg = get_runtime()
        # token rides in Sec-WebSocket-Protocol as ["bearer", <token>] (browsers can't
        # set an Authorization header on a WebSocket). Reject before accept on mismatch.
        token = extract_ws_token(websocket)
        if cfg.access_token and token != cfg.access_token:
            await websocket.close(code=4003)
            return

        # Echo the "bearer" subprotocol back when the client offered it. Chromium-based
        # browsers (Edge/Chrome) FAIL a WebSocket that requested subprotocols if the 101
        # selects none — onopen never sticks, the socket drops 1006 right after open, and
        # the frontend reconnect-loops. We only echo when "bearer" was actually offered;
        # the no-token path sends no subprotocol, so we must not invent one (selecting a
        # protocol the client didn't offer makes the browser fail too). Verified stable
        # through the pyfrpc relay as well.
        offered = [p.strip() for p in
                   websocket.headers.get("sec-websocket-protocol", "").split(",") if p.strip()]
        subproto = "bearer" if offered and offered[0].lower() == "bearer" else None
        await websocket.accept(subprotocol=subproto)
        if hub is not None:
            hub.add(websocket)
        conn_sid = str(uuid.uuid4())  # unique ID for this WS connection
        active_sid: str | None = None  # PTY session sid we are attached to

        async def _pump(entry, pump_sid: str) -> None:
            """Persistent background task: reads PTY output, buffers it, forwards to attached WS.

            Runs for the full lifetime of the PTY process, independent of WebSocket
            connect/disconnect cycles. When the process exits, notifies the attached
            WebSocket (if any) and removes the entry from the registry.
            """
            try:
                while True:
                    chunk = await entry.pty.read()
                    if not chunk:
                        break
                    entry.append(chunk)
                    ws = entry.ws
                    if ws is not None:
                        try:
                            await ws.send_bytes(chunk)
                        except Exception:
                            entry.ws = None
            except Exception as exc:
                log.warning("pump %s ended: %s", pump_sid, exc)
            finally:
                pty_manager.remove(pump_sid)
                ws = entry.ws
                entry.ws = None
                if ws is not None:
                    try:
                        await ws.send_text(json.dumps({"type": "closed", "sid": pump_sid}))
                    except Exception:
                        pass
                try:
                    store.mark_closed(pump_sid)
                except Exception as exc:
                    log.warning("mark_closed failed: %s", exc)
                log.info("pty %s exited", pump_sid)

        try:
            while True:
                try:
                    msg = await asyncio.wait_for(websocket.receive(), timeout=RECV_TIMEOUT)
                except asyncio.TimeoutError:
                    break
                if msg["type"] == "websocket.disconnect":
                    break
                if not msg.get("text"):
                    continue

                try:
                    data = json.loads(msg["text"])
                except json.JSONDecodeError:
                    continue
                mtype = data.get("type")

                if mtype == "spawn":
                    if active_sid is not None:
                        continue  # already attached to a session

                    resume_sid = data.get("resume")

                    # Reconnect path: PTY is still running from a previous connection
                    if resume_sid:
                        entry = pty_manager.get(resume_sid)
                        if entry is not None:
                            buf = entry.get_buffered()
                            if buf:
                                await websocket.send_bytes(buf)
                            entry.ws = websocket
                            active_sid = resume_sid
                            await websocket.send_text(json.dumps({
                                "type": "spawned", "sid": resume_sid,
                                "pid": entry.pid, "cwd": data.get("cwd", ""),
                            }))
                            log.info("ws reattached to running pty %s", resume_sid)
                            continue

                    # Spawn path: fresh session or dead resume (spawn new Claude with --resume)
                    effective_sid = resume_sid or conn_sid
                    argv, env, cols, rows, cwd = build_spawn(
                        data, cfg.claude_bin, effective_sid, models=cfg.models,
                    )
                    # Resuming into Claude (built-in profile, local OAuth): strip foreign
                    # (non-Claude / unsigned) thinking blocks left by a prior model,
                    # else their missing signatures 400 on the first request.
                    # Best-effort: never let cleaning failures block the spawn.
                    if resume_sid and is_claude_target(data, cfg.models):
                        try:
                            res = clean_for_claude(resume_sid)
                            if res["removed"]:
                                log.info("sanitized %s foreign thinking block(s) before resuming %s (ok=%s)",
                                         res["removed"], resume_sid, res["ok"])
                        except Exception as exc:
                            log.warning("session clean skipped for %s: %s", resume_sid, exc)
                    try:
                        session = create_pty(argv, env, cols, rows, cwd)
                        entry = pty_manager.register(effective_sid, session)
                        entry.ws = websocket
                        active_sid = effective_sid
                        entry.pump_task = asyncio.create_task(_pump(entry, effective_sid))
                        await websocket.send_text(json.dumps({
                            "type": "spawned", "sid": effective_sid,
                            "pid": session.pid, "cwd": cwd or os.getcwd(),
                        }))
                        try:
                            model_id = data.get("model_id")
                            model_name = next(
                                (m["name"] for m in (cfg.models or [])
                                 if m.get("id") == model_id),
                                "",
                            ) if model_id else ""
                            # Special shell entries aren't in cfg.models — supply a friendly name
                            if not model_name:
                                model_name = shell_display_name(model_id)
                            store.record_spawn(
                                effective_sid, cwd,
                                model_id, model_name, cols, rows,
                            )
                        except Exception as exc:
                            log.warning("record_spawn failed: %s", exc)
                    except Exception as exc:
                        log.error("spawn failed: %s", exc)
                        await websocket.send_text(json.dumps({
                            "type": "spawn_error", "sid": effective_sid, "error": str(exc),
                        }))

                elif mtype == "input":
                    if active_sid:
                        raw = data.get("data", "")
                        pty_manager.write(active_sid, raw.encode("utf-8") if isinstance(raw, str) else raw)

                elif mtype == "resize":
                    if active_sid:
                        pty_manager.resize(active_sid, int(data["cols"]), int(data["rows"]))

                elif mtype == "close":
                    if active_sid:
                        pty_manager.kill(active_sid)

                elif mtype == "ping":
                    # App-level keepalive. uvicorn's control-frame PING/PONG doesn't survive
                    # the frp HTTP proxy, so the client heartbeats with a {"type":"ping"} DATA
                    # frame and we answer with a {"type":"pong"} DATA frame. Data frames are
                    # forwarded reliably, so this round-trip keeps idle tunnels (and any proxy
                    # read timeout in between) alive in both directions.
                    try:
                        await websocket.send_text(json.dumps({"type": "pong"}))
                    except Exception:
                        pass

                # other unknown types are silently ignored

        except WebSocketDisconnect:
            pass
        finally:
            if hub is not None:
                hub.discard(websocket)
            # Detach WebSocket from the PTY entry; PTY keeps running in the background.
            if active_sid:
                entry = pty_manager.get(active_sid)
                if entry is not None:
                    entry.ws = None
            log.info("ws connection %s detached from pty %s", conn_sid, active_sid)

    return router
