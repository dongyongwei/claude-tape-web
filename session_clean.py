"""Sanitize Claude Code session jsonl before resuming into Claude.

When a session has been driven by a third-party model (a configured model with
ANTHROPIC_BASE_URL), that model's `thinking` blocks carry no valid Anthropic
signature. Replaying them to Claude triggers:

    API Error: 400 messages.N.content.0: Invalid signature in thinking block

This module strips those bad thinking blocks from the session jsonl right before
we relaunch `claude --resume <id>`, so the resumed conversation is accepted.

Discriminator (logical OR), evaluated per thinking block:
  * the assistant record's message.model prefix is NOT `claude-`, OR
  * the thinking block's `signature` is missing/empty.
Genuine Claude thinking blocks always carry a signature, so they are never
touched. The jsonl is a uuid/parentUuid tree where each content block is its own
record; deleting a thinking-only record re-links its children to the deleted
record's parent so the chain stays intact.

Self-contained (stdlib only) so the app packages standalone with Nuitka.
"""
from __future__ import annotations

import json
import glob
import os
import shutil
from pathlib import Path

CLAUDE_PREFIX = "claude-"


def _projects_dir() -> Path:
    return Path.home() / ".claude" / "projects"


def find_session_files(session_id: str, projects_dir: Path | None = None) -> list[str]:
    """Locate <session_id>.jsonl across all project dirs (session id is a UUID, unique)."""
    base = projects_dir or _projects_dir()
    return sorted(glob.glob(str(base / "*" / f"{session_id}.jsonl")))


def _is_assistant(d: dict) -> bool:
    m = d.get("message")
    return isinstance(m, dict) and m.get("role") == "assistant"


def _is_foreign(d: dict, keep_prefix: str) -> bool:
    model = d.get("message", {}).get("model")
    return not (isinstance(model, str) and model.startswith(keep_prefix))


def _bad_thinking(b, foreign: bool) -> bool:
    if not (isinstance(b, dict) and b.get("type") == "thinking"):
        return False
    return foreign or (not b.get("signature"))


def _load(path: str):
    recs = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s:
                recs.append((line, None))
                continue
            try:
                recs.append((line, json.loads(s)))
            except Exception:
                recs.append((line, None))
    return recs


def _plan(recs, keep_prefix: str):
    deleted: set = set()
    modified: dict = {}
    removed = 0
    for _, d in recs:
        if d is None or not _is_assistant(d):
            continue
        content = d["message"].get("content")
        if not isinstance(content, list):
            continue
        foreign = _is_foreign(d, keep_prefix)
        kept = [b for b in content if not _bad_thinking(b, foreign)]
        n = len(content) - len(kept)
        if n == 0:
            continue
        removed += n
        uuid = d.get("uuid")
        if len(kept) == 0 and uuid is not None:
            deleted.add(uuid)
        else:
            nd = json.loads(json.dumps(d))
            nd["message"]["content"] = kept
            modified[uuid] = nd
    return deleted, modified, removed


def _rewrite(recs, deleted: set, modified: dict):
    parent_of = {}
    for _, d in recs:
        if isinstance(d, dict) and d.get("uuid") is not None:
            parent_of[d["uuid"]] = d.get("parentUuid")

    def surviving(u):
        seen = set()
        while u is not None and u in deleted and u not in seen:
            seen.add(u)
            u = parent_of.get(u)
        return u

    out = []
    for raw, d in recs:
        if d is None:
            out.append(raw)
            continue
        if d.get("uuid") in deleted:
            continue
        changed = False
        uuid = d.get("uuid")
        if uuid in modified:
            d = modified[uuid]
            changed = True
        p = d.get("parentUuid")
        if p is not None and p in deleted:
            d = json.loads(json.dumps(d)) if not changed else d
            d["parentUuid"] = surviving(p)
            changed = True
        if d.get("leafUuid") is not None and d["leafUuid"] in deleted:
            d = json.loads(json.dumps(d)) if not changed else d
            d["leafUuid"] = surviving(d["leafUuid"])
            changed = True
        out.append(json.dumps(d, ensure_ascii=False, separators=(",", ":")) + "\n"
                   if changed else raw)
    return out


def _verify(path: str, keep_prefix: str):
    recs = _load(path)
    uuids = {d["uuid"] for _, d in recs
             if isinstance(d, dict) and d.get("uuid") is not None}
    problems = []
    bad_json = dangling = empty = bad_think = 0
    for raw, d in recs:
        if raw.strip() and d is None:
            bad_json += 1
            continue
        if d is None:
            continue
        p = d.get("parentUuid")
        if p is not None and p not in uuids:
            dangling += 1
        if d.get("leafUuid") is not None and d["leafUuid"] not in uuids:
            problems.append("leafUuid dangling")
        if _is_assistant(d):
            c = d["message"].get("content")
            if isinstance(c, list) and len(c) == 0:
                empty += 1
            foreign = _is_foreign(d, keep_prefix)
            for b in (c or []):
                if _bad_thinking(b, foreign):
                    bad_think += 1
    if bad_json:
        problems.append(f"{bad_json} unparseable lines")
    if dangling:
        problems.append(f"{dangling} dangling parentUuid")
    if empty:
        problems.append(f"{empty} empty assistant content")
    if bad_think:
        problems.append(f"{bad_think} bad thinking blocks remain")
    return (len(problems) == 0), problems


def clean_file(path: str, keep_prefix: str = CLAUDE_PREFIX,
               make_backup: bool = True) -> dict:
    """Strip bad thinking blocks from one jsonl. Returns a result dict.

    On self-check failure the original is restored from backup (if made) so a
    resume never reads a corrupted file.
    """
    recs = _load(path)
    deleted, modified, removed = _plan(recs, keep_prefix)
    if removed == 0:
        return {"path": path, "removed": 0, "ok": True, "changed": False}
    if make_backup:
        shutil.copy2(path, path + ".bak")
    out = _rewrite(recs, deleted, modified)
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.writelines(out)
    ok, problems = _verify(path, keep_prefix)
    if not ok and make_backup:
        shutil.copy2(path + ".bak", path)  # restore, do not leave it broken
        return {"path": path, "removed": removed, "ok": False,
                "restored": True, "problems": problems}
    return {"path": path, "removed": removed, "ok": ok, "changed": True,
            "deleted": len(deleted), "problems": problems}


def clean_for_claude(session_id: str, keep_prefix: str = CLAUDE_PREFIX,
                     projects_dir: Path | None = None) -> dict:
    """Clean the jsonl(s) for a session id before resuming into Claude.

    Returns {"removed": int, "ok": bool, "files": [per-file results]}.
    Never raises for "file not found" — returns removed=0.
    """
    files = find_session_files(session_id, projects_dir)
    results = [clean_file(f, keep_prefix) for f in files]
    return {
        "session_id": session_id,
        "files": results,
        "removed": sum(r["removed"] for r in results),
        "ok": all(r["ok"] for r in results),
    }
