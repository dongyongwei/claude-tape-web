import asyncio
import json
import logging
import os
import uuid

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from pty import create as create_pty
from pty_manager import PtyManager

from session_store import SessionStore
from spawn import build_spawn

log = logging.getLogger("term")

RECV_TIMEOUT = 90


def make_router(get_runtime, store: SessionStore) -> APIRouter:
    """get_runtime() → (config, argv_map), lazily resolved at connection time for testability.

    store: session index store; written only on successful spawn or connection close,
    never on the data path.
    """
    router = APIRouter()

    @router.websocket("/ws/term")
    async def term_ws(websocket: WebSocket, token: str = Query("")):
        cfg, argv_map = get_runtime()
        if cfg.access_token and token != cfg.access_token:
            await websocket.close(code=4003)
            return

        await websocket.accept()
        manager = PtyManager()
        sid = str(uuid.uuid4())
        read_task: asyncio.Task | None = None
        recorded_sid: str | None = None  # recorded sid (resume takes priority)

        async def pump(session) -> None:
            try:
                while True:
                    chunk = await session.read()
                    if not chunk:
                        break
                    await websocket.send_bytes(chunk)
            except Exception as exc:
                log.warning("pump %s ended: %s", sid, exc)
            finally:
                manager.remove(sid)
                try:
                    await websocket.send_text(json.dumps({"type": "closed", "sid": sid}))
                except Exception:
                    pass

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
                    if manager.get(sid) is not None:
                        continue  # one connection per session, ignore if already exists
                    argv, env, cols, rows, cwd = build_spawn(
                        data, argv_map, cfg.claude_bin, sid, models=cfg.models,
                    )
                    try:
                        session = create_pty(argv, env, cols, rows, cwd)
                        manager.register(sid, session)
                        read_task = asyncio.create_task(pump(session))
                        await websocket.send_text(json.dumps({
                            "type": "spawned", "sid": sid,
                            "pid": session.pid, "cwd": cwd or os.getcwd(),
                        }))
                        # side-channel: record session index; failure must not affect the data path
                        try:
                            effective_sid = data.get("resume") or sid
                            model_id = data.get("model_id")
                            model_name = next(
                                (m["name"] for m in (cfg.models or [])
                                 if m.get("id") == model_id),
                                "",
                            ) if model_id else ""
                            store.record_spawn(
                                effective_sid, cwd, data.get("command_id", "ccp"),
                                model_id, model_name, cols, rows,
                            )
                            recorded_sid = effective_sid
                        except Exception as exc:
                            log.warning("record_spawn failed: %s", exc)
                    except Exception as exc:
                        log.error("spawn failed: %s", exc)
                        await websocket.send_text(json.dumps({
                            "type": "spawn_error", "sid": sid, "error": str(exc),
                        }))

                elif mtype == "input":
                    raw = data.get("data", "")
                    manager.write(sid, raw.encode("utf-8") if isinstance(raw, str) else raw)

                elif mtype == "resize":
                    manager.resize(sid, int(data["cols"]), int(data["rows"]))

                elif mtype == "close":
                    manager.kill(sid)

        except WebSocketDisconnect:
            pass
        finally:
            manager.kill_all()
            if read_task is not None:
                read_task.cancel()
            if recorded_sid:
                try:
                    store.mark_closed(recorded_sid)
                except Exception as exc:
                    log.warning("mark_closed failed: %s", exc)
            log.info("terminal connection %s closed", sid)

    return router
