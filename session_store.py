import json
import re
from datetime import datetime
from pathlib import Path

_DEFAULT_SLUG = "_default"
# replace drive-letter colon and path separators with '-', matching ~/.claude/projects style
_SLUG_SUB = re.compile(r"[:/\\]")


def default_root() -> Path:
    """Root directory for session index files, co-located with config.json so upgrades preserve data."""
    return Path.home() / ".agent_win_serve" / "sessions"


def slug_for(cwd: str | None) -> str:
    """Encode cwd as a directory name; empty/None maps to _default."""
    s = (cwd or "").strip()
    if not s:
        return _DEFAULT_SLUG
    slug = _SLUG_SUB.sub("-", s).strip("-")
    return slug or _DEFAULT_SLUG


def _now() -> str:
    return datetime.now().isoformat()


def _dump(path: Path, rec: dict) -> None:
    path.write_text(json.dumps(rec, ensure_ascii=False, indent=2), encoding="utf-8")


class SessionStore:
    """File-backed session index: one JSON file per session, organised by project slug."""

    def __init__(self, root: Path | None = None) -> None:
        self._root = Path(root) if root is not None else default_root()

    def record_spawn(
        self,
        sid: str,
        cwd: str | None,
        model_id: str | None = None,
        model_name: str | None = None,
        cols: int = 120,
        rows: int = 30,
    ) -> None:
        proj = self._root / slug_for(cwd)
        proj.mkdir(parents=True, exist_ok=True)
        self._ensure_meta(proj, cwd)
        path = proj / f"{sid}.json"
        now = _now()
        existing = self._read(path) if path.exists() else None
        if existing:
            existing["last_active_at"] = now
            existing["status"] = "active"
            _dump(path, existing)
            return
        _dump(path, {
            "sid": sid, "cwd": cwd or "",
            "model_id": model_id or "", "model_name": model_name or "",
            "tag": "",
            "cols": int(cols), "rows": int(rows),
            "created_at": now, "last_active_at": now, "status": "active",
        })

    def list_grouped(self) -> list[dict]:
        groups: list[dict] = []
        if not self._root.exists():
            return groups
        for proj in self._root.iterdir():
            if not proj.is_dir():
                continue
            sessions = []
            for f in proj.glob("*.json"):
                if f.name == "meta.json":
                    continue
                rec = self._read(f)
                if rec:
                    sessions.append(rec)
            if not sessions:
                continue
            # sort by last_active_at (includes microseconds for higher precision)
            sessions.sort(key=lambda r: r.get("last_active_at", ""), reverse=True)
            meta = self._read(proj / "meta.json") or {}
            groups.append({
                "slug": proj.name,
                "cwd": meta.get("cwd", ""),
                "sessions": sessions,
            })
        # sort groups by their most recent session's last_active_at
        groups.sort(key=lambda g: g["sessions"][0].get("last_active_at", ""),
                    reverse=True)
        return groups

    def mark_closed(self, sid: str) -> None:
        path = self._find(sid)
        if not path:
            return
        rec = self._read(path)
        if not rec:
            return
        rec["status"] = "closed"
        rec["last_active_at"] = _now()
        _dump(path, rec)

    def patch_session(self, sid: str, updates: dict) -> bool:
        path = self._find(sid)
        if not path:
            return False
        rec = self._read(path)
        if not rec:
            return False
        for key in ("tag", "model_id", "model_name"):
            if key in updates:
                rec[key] = str(updates[key])
        _dump(path, rec)
        return True

    def delete(self, sid: str) -> bool:
        path = self._find(sid)
        if not path:
            return False
        try:
            path.unlink()
            return True
        except OSError:
            return False

    def _find(self, sid: str) -> "Path | None":
        if not self._root.exists():
            return None
        for proj in self._root.iterdir():
            if proj.is_dir():
                candidate = proj / f"{sid}.json"
                if candidate.exists():
                    return candidate
        return None

    def _ensure_meta(self, proj: Path, cwd: str | None) -> None:
        meta = proj / "meta.json"
        if not meta.exists():
            _dump(meta, {"cwd": cwd or ""})

    @staticmethod
    def _read(path: Path) -> dict | None:
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None
