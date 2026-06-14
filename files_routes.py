"""File-manager REST router (prefix /api/files).

A full-disk web file browser/editor exposed to the PC frontend. Every endpoint is
guarded by the same Bearer-token dependency as the rest of the app (`make_require_token`),
so even under public frp exposure only a token holder can reach it.

Path handling: every incoming path is `Path(...).resolve()`d to an absolute path.
New names (upload/mkdir/rename) are reduced to their bare `.name` so `../` can never
escape the parent dir. `delete` refuses a drive/filesystem root as a last-resort guard
against catastrophic mistakes. Text vs binary is decided by extension allowlist plus a
NUL-byte sniff; only text under TEXT_MAX is editable inline, images preview, the rest
download only.
"""
import mimetypes
import shutil
import string
from pathlib import Path

from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse

from auth import make_require_token

TEXT_MAX = 1 * 1024 * 1024  # inline preview/edit ceiling: 1 MiB
_SNIFF = 8192  # bytes read to sniff binary content

_TEXT_EXT = {
    ".txt", ".md", ".markdown", ".mdown", ".mkd", ".rst", ".log", ".csv", ".tsv",
    ".py", ".js", ".mjs", ".cjs", ".ts", ".jsx", ".tsx", ".json", ".json5",
    ".html", ".htm", ".xml", ".css", ".scss", ".less", ".vue", ".svelte",
    ".yml", ".yaml", ".toml", ".ini", ".cfg", ".conf", ".env", ".properties",
    ".sh", ".bash", ".zsh", ".ps1", ".bat", ".cmd",
    ".c", ".h", ".cpp", ".hpp", ".cc", ".java", ".go", ".rs", ".rb", ".php",
    ".sql", ".lua", ".pl", ".r", ".kt", ".swift", ".dart", ".gradle",
    ".gitignore", ".dockerignore", ".editorconfig",
}
_IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".ico"}


def _kind(p: Path) -> str:
    """Classify an entry for the frontend: text / image / other."""
    ext = p.suffix.lower()
    if ext in _IMAGE_EXT:
        return "image"
    if ext in _TEXT_EXT:
        return "text"
    return "other"


def _looks_binary(p: Path) -> bool:
    """True if the file's leading bytes contain a NUL (heuristic binary check)."""
    try:
        with p.open("rb") as fh:
            return b"\x00" in fh.read(_SNIFF)
    except OSError:
        return True


def _resolve(raw: str) -> Path:
    """Resolve a client-supplied path string to an absolute Path."""
    if not raw:
        raise HTTPException(status_code=400, detail="path required")
    return Path(raw).resolve()


def _is_root(p: Path) -> bool:
    """True if p is a filesystem/drive root (e.g. C:\\ or /)."""
    return p == p.parent


def _safe_name(raw) -> str:
    """A user-typed file/dir name that is a single path component, else raise 400.

    Rejects empty, path separators, traversal — so mkdir/rename can never escape the
    parent dir. (Upload filenames come from the browser and are sanitized via .name
    instead, since the request cannot be retried by the user.)
    """
    name = str(raw or "")
    if not name or name in (".", "..") or name != Path(name).name:
        raise HTTPException(status_code=400, detail="invalid name")
    return name


def make_files_router(get_runtime):
    """get_runtime() -> cfg (provides .access_token); same shape as the other routers."""
    router = APIRouter(prefix="/api/files")
    require_token = make_require_token(get_runtime)
    guard = [Depends(require_token)]

    @router.get("/drives", dependencies=guard)
    def drives():
        """List Windows drive roots plus the user home as a convenient entry point."""
        out = [{"path": str(Path.home()), "label": "Home"}]
        for letter in string.ascii_uppercase:
            root = Path(f"{letter}:\\")
            if root.exists():
                out.append({"path": str(root), "label": f"{letter}:"})
        return out

    @router.get("/list", dependencies=guard)
    def list_dir(path: str):
        d = _resolve(path)
        if not d.is_dir():
            raise HTTPException(status_code=404, detail="directory not found")
        entries = []
        try:
            children = sorted(
                d.iterdir(), key=lambda c: (not c.is_dir(), c.name.lower())
            )
        except OSError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        for c in children:
            try:
                st = c.stat()
                is_dir = c.is_dir()
            except OSError:
                continue  # unreadable entry (permission, broken link) — skip
            entries.append({
                "name": c.name,
                "is_dir": is_dir,
                "size": 0 if is_dir else st.st_size,
                "mtime": st.st_mtime,
                "kind": "dir" if is_dir else _kind(c),
            })
        return {"path": str(d), "parent": None if _is_root(d) else str(d.parent),
                "entries": entries}

    @router.get("/read", dependencies=guard)
    def read_text(path: str):
        f = _resolve(path)
        if not f.is_file():
            raise HTTPException(status_code=404, detail="file not found")
        if f.stat().st_size > TEXT_MAX or _looks_binary(f):
            raise HTTPException(status_code=400, detail="needs_download")
        try:
            content = f.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            raise HTTPException(status_code=400, detail="needs_download")
        return {"content": content}

    @router.get("/raw", dependencies=guard)
    def raw(path: str):
        f = _resolve(path)
        if not f.is_file():
            raise HTTPException(status_code=404, detail="file not found")
        mime = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
        return FileResponse(f, media_type=mime,
                            content_disposition_type="inline")

    @router.get("/download", dependencies=guard)
    def download(path: str):
        f = _resolve(path)
        if not f.is_file():
            raise HTTPException(status_code=404, detail="file not found")
        return FileResponse(f, filename=f.name,
                            content_disposition_type="attachment")

    @router.post("/write", dependencies=guard)
    def write_text(body: dict = Body(...)):
        f = _resolve(body.get("path", ""))
        try:
            f.write_text(body.get("content", ""), encoding="utf-8")
        except OSError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        return {"saved": True}

    @router.post("/mkdir", dependencies=guard)
    def mkdir(body: dict = Body(...)):
        parent = _resolve(body.get("path", ""))
        name = _safe_name(body.get("name"))
        target = parent / name
        try:
            target.mkdir(parents=False, exist_ok=False)
        except OSError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        return {"created": str(target)}

    @router.post("/rename", dependencies=guard)
    def rename(body: dict = Body(...)):
        src = _resolve(body.get("path", ""))
        new_name = _safe_name(body.get("new_name"))
        if not src.exists():
            raise HTTPException(status_code=404, detail="not found")
        dst = src.parent / new_name
        try:
            src.rename(dst)
        except OSError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        return {"renamed": str(dst)}

    @router.post("/delete", dependencies=guard)
    def delete(body: dict = Body(...)):
        p = _resolve(body.get("path", ""))
        if _is_root(p):
            raise HTTPException(status_code=400, detail="refusing to delete a root")
        if not p.exists():
            raise HTTPException(status_code=404, detail="not found")
        try:
            if p.is_dir():
                shutil.rmtree(p)
            else:
                p.unlink()
        except OSError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        return {"deleted": str(p)}

    @router.post("/upload", dependencies=guard)
    async def upload(dir: str = Form(...), file: UploadFile = File(...)):
        d = _resolve(dir)
        if not d.is_dir():
            raise HTTPException(status_code=404, detail="directory not found")
        name = Path(file.filename or "").name
        if not name:
            raise HTTPException(status_code=400, detail="invalid filename")
        target = d / name
        try:
            with target.open("wb") as out:
                while chunk := await file.read(1024 * 1024):
                    out.write(chunk)
        except OSError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        return JSONResponse({"uploaded": str(target)})

    return router
