// Mobile web file manager. Loads after mobile.js, so the cross-script globals
// `$`, `t`, `esc`, `showConfirm` and the Bearer-injecting `fetch` wrapper are
// already in place. Exposes `window.filesOpen()`, called by mobile.js when the
// Files view opens. Unlike the desktop split layout, mobile shows a touch list
// and a slide-up preview sheet.
(function () {
  const API = "/api/files";
  let cwd = "";          // current absolute dir
  let parent = null;     // parent dir of cwd (null at a root)
  let inited = false;    // one-time DOM binding guard
  let objUrl = null;     // last preview blob URL, revoked on replacement

  // ---------- helpers ----------
  const escHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function setErr(msg) { $("fm-err").textContent = msg || ""; }

  function joinPath(dir, name) {
    return dir.replace(/[\\/]+$/, "") + "/" + name; // backend resolves / on Windows too
  }

  function fmtSize(n) {
    if (n < 1024) return n + " B";
    const u = ["KB", "MB", "GB", "TB"];
    let i = -1;
    do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
    return n.toFixed(1) + " " + u[i];
  }

  function fmtTime(sec) {
    const d = new Date(sec * 1000);
    if (isNaN(d)) return "";
    const p = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  async function detail(r) {
    const body = await r.json().catch(() => ({}));
    return body.detail || t("fm_load_fail");
  }

  async function jget(path, params) {
    const qs = params ? "?" + new URLSearchParams(params) : "";
    const r = await fetch(API + path + qs);
    if (!r.ok) throw new Error(await detail(r));
    return r.json();
  }

  async function jpost(path, body) {
    const r = await fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await detail(r));
    return r.json();
  }

  function freeObjUrl() {
    if (objUrl) { URL.revokeObjectURL(objUrl); objUrl = null; }
  }

  // Minimal GitHub-ish stylesheet for the Markdown preview iframe.
  const MD_CSS =
    "body.md{font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;" +
    "color:#1d1d1f;max-width:820px;margin:0 auto;padding:18px}" +
    "body.md h1,body.md h2{border-bottom:1px solid #eaecef;padding-bottom:.3em}" +
    "body.md h1,body.md h2,body.md h3,body.md h4{margin:1.2em 0 .6em;line-height:1.25}" +
    "body.md p,body.md ul,body.md ol,body.md blockquote,body.md table{margin:0 0 1em}" +
    "body.md code{background:#f2f2f5;border-radius:4px;padding:.15em .35em;" +
    "font:12px ui-monospace,Consolas,monospace}" +
    "body.md pre{background:#f6f8fa;border-radius:8px;padding:14px;overflow:auto}" +
    "body.md pre code{background:none;padding:0}" +
    "body.md blockquote{border-left:3px solid #d0d7de;color:#6e6e73;padding:0 1em}" +
    "body.md table{border-collapse:collapse}body.md th,body.md td{border:1px solid #d0d7de;padding:6px 12px}" +
    "body.md img{max-width:100%}body.md a{color:#C45A3A}";

  // Render Markdown source to a standalone HTML document for an iframe srcdoc.
  function mdDoc(src) {
    const body = (window.marked && window.marked.parse)
      ? window.marked.parse(src, { gfm: true, breaks: true })
      : "<pre>" + escHtml(src) + "</pre>";
    return '<!doctype html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      "<style>" + MD_CSS + "</style></head><body class=\"md\">" + body + "</body></html>";
  }

  // ---------- navigation / listing ----------
  async function loadDrives() {
    const drives = await jget("/drives");
    $("fm-drive").innerHTML = drives
      .map((d) => `<option value="${escHtml(d.path)}">${escHtml(d.label)}</option>`)
      .join("");
  }

  async function go(path) {
    setErr("");
    try {
      const data = await jget("/list", { path });
      cwd = data.path;
      parent = data.parent;
      $("fm-path").value = cwd;
      renderList(data.entries);
    } catch (e) {
      setErr(e.message);
    }
  }

  function renderList(entries) {
    const rows = entries.map((e) => {
      const icon = e.is_dir ? "📁" : e.kind === "image" ? "🖼" : e.kind === "text" ? "📄" : "📦";
      const sub = e.is_dir ? fmtTime(e.mtime)
        : `${fmtSize(e.size)} · ${fmtTime(e.mtime)}`;
      const dl = e.is_dir ? "" :
        `<button class="fm-act" data-act="download" title="${escHtml(t("fm_download"))}">↓</button>`;
      return `<div class="fm-row" data-name="${escHtml(e.name)}" data-dir="${e.is_dir ? 1 : 0}" data-kind="${e.kind}">
        <span class="fm-ic">${icon}</span>
        <div class="fm-meta" data-act="open">
          <div class="fm-nm">${escHtml(e.name)}</div>
          <div class="fm-sub">${sub}</div>
        </div>
        <div class="fm-acts">${dl}<button class="fm-act" data-act="rename" title="${escHtml(t("fm_rename"))}">✎</button><button class="fm-act fm-act-del" data-act="delete" title="${escHtml(t("fm_delete"))}">🗑</button></div>
      </div>`;
    }).join("");
    $("fm-list").innerHTML = rows ||
      `<div class="fm-empty">${escHtml(t("fm_empty"))}</div>`;
  }

  // ---------- preview sheet ----------
  function pvOpen() { $("fm-pv").classList.add("on"); }
  function pvClose() {
    freeObjUrl();
    const pv = $("fm-pv");
    pv.classList.remove("on");
    pv.innerHTML = "";
  }
  // Standard sheet header: back button (closes the sheet) + filename + extra controls.
  function pvHead(name, extra) {
    return `<div class="fm-pv-head"><button class="fm-pv-back" aria-label="Back">‹</button>` +
      `<span class="fm-pv-name">${escHtml(name)}</span>${extra || ""}</div>`;
  }
  function bindBack() {
    const b = $("fm-pv").querySelector(".fm-pv-back");
    if (b) b.onclick = pvClose;
  }

  async function previewText(path, name) {
    try {
      const { content } = await jget("/read", { path });
      freeObjUrl();
      const lower = name.toLowerCase();
      const isHtml = /\.html?$/.test(lower);
      const isMd = /\.(md|markdown|mdown|mkd)$/.test(lower);
      const canRender = isHtml || isMd;
      // HTML previews its own scripts (isolated null origin); Markdown renders to
      // static HTML with no script execution.
      const sandbox = isHtml ? "allow-scripts" : "";
      const pv = $("fm-pv");
      pv.innerHTML =
        pvHead(name,
          (canRender ? `<button id="fm-render" class="fm-btn">${escHtml(t("fm_render"))}</button>` : "") +
          `<button id="fm-save" class="fm-btn">${escHtml(t("fm_save"))}</button>` +
          `<span id="fm-save-msg" class="fm-save-msg"></span>`) +
        `<textarea id="fm-editor" class="fm-editor" spellcheck="false"></textarea>` +
        (canRender ? `<iframe id="fm-frame" class="fm-frame" sandbox="${sandbox}" hidden></iframe>` : "");
      bindBack();
      $("fm-editor").value = content;
      $("fm-save").onclick = async () => {
        try {
          await jpost("/write", { path, content: $("fm-editor").value });
          $("fm-save-msg").textContent = t("fm_saved");
          setTimeout(() => { $("fm-save-msg").textContent = ""; }, 1500);
        } catch (e) { setErr(e.message); pvClose(); }
      };
      if (canRender) {
        let showing = false; // false = source (editable), true = rendered preview
        $("fm-render").onclick = () => {
          showing = !showing;
          const frame = $("fm-frame");
          if (showing) frame.srcdoc = isMd ? mdDoc($("fm-editor").value) : $("fm-editor").value;
          frame.hidden = !showing;
          $("fm-editor").hidden = showing;
          $("fm-render").textContent = showing ? t("fm_source") : t("fm_render");
        };
      }
      pvOpen();
    } catch (e) {
      previewBinary(path, name); // e.g. needs_download (too large / not utf-8)
    }
  }

  async function previewImage(path, name) {
    try {
      const r = await fetch(API + "/raw?" + new URLSearchParams({ path }));
      if (!r.ok) return previewBinary(path, name);
      freeObjUrl();
      objUrl = URL.createObjectURL(await r.blob());
      const pv = $("fm-pv");
      pv.innerHTML =
        pvHead(name, `<button id="fm-dl" class="fm-btn">${escHtml(t("fm_download"))}</button>`) +
        `<div class="fm-pv-img"><img alt=""></div>`;
      bindBack();
      pv.querySelector("img").src = objUrl;
      $("fm-dl").onclick = () => download(path, name);
      pvOpen();
    } catch (e) { setErr(e.message); }
  }

  function previewBinary(path, name) {
    freeObjUrl();
    const pv = $("fm-pv");
    pv.innerHTML =
      pvHead(name) +
      `<div class="fm-pv-empty"><div>${escHtml(t("fm_binary"))}</div>` +
      `<button id="fm-dl" class="fm-btn">${escHtml(t("fm_download"))}</button></div>`;
    bindBack();
    $("fm-dl").onclick = () => download(path, name);
    pvOpen();
  }

  // ---------- file ops ----------
  async function download(path, name) {
    try {
      const r = await fetch(API + "/download?" + new URLSearchParams({ path }));
      if (!r.ok) throw new Error(await detail(r));
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setErr(e.message); }
  }

  async function doRename(path, name) {
    const nn = prompt(t("fm_prompt_rename"), name);
    if (!nn || nn === name) return;
    try { await jpost("/rename", { path, new_name: nn }); go(cwd); }
    catch (e) { setErr(e.message); }
  }

  async function doDelete(path, name) {
    if (!(await showConfirm(t("fm_confirm_delete").replace("{0}", name)))) return;
    try { await jpost("/delete", { path }); go(cwd); }
    catch (e) { setErr(e.message); }
  }

  // ---------- one-time DOM wiring ----------
  function bind() {
    $("fm-up").onclick = () => { if (parent) go(parent); };
    $("fm-refresh").onclick = () => go(cwd);
    $("fm-go").onclick = () => go($("fm-path").value.trim());
    $("fm-path").addEventListener("keydown", (e) => {
      if (e.key === "Enter") go($("fm-path").value.trim());
    });
    $("fm-drive").onchange = () => go($("fm-drive").value);

    $("fm-mkdir").onclick = async () => {
      const name = prompt(t("fm_prompt_mkdir"));
      if (!name) return;
      try { await jpost("/mkdir", { path: cwd, name }); go(cwd); }
      catch (e) { setErr(e.message); }
    };

    $("fm-upload").onclick = () => $("fm-upload-input").click();
    $("fm-upload-input").onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("dir", cwd);
      fd.append("file", file);
      try {
        const r = await fetch(API + "/upload", { method: "POST", body: fd });
        if (!r.ok) throw new Error(await detail(r));
        go(cwd);
      } catch (err) { setErr(err.message); }
      finally { e.target.value = ""; }
    };

    // delegated row actions
    $("fm-list").addEventListener("click", (ev) => {
      const row = ev.target.closest(".fm-row[data-name]");
      if (!row) return;
      const btn = ev.target.closest("[data-act]");
      const act = btn ? btn.dataset.act : null;
      const name = row.dataset.name;
      const isDir = row.dataset.dir === "1";
      const kind = row.dataset.kind;
      const path = joinPath(cwd, name);
      if (act === "download") return download(path, name);
      if (act === "rename") return doRename(path, name);
      if (act === "delete") return doDelete(path, name);
      // "open" (name/meta tap)
      if (isDir) return go(path);
      if (kind === "text") return previewText(path, name);
      if (kind === "image") return previewImage(path, name);
      return previewBinary(path, name);
    });
  }

  async function filesOpen(startDir) {
    setErr("");
    if (inited) return;
    inited = true;
    bind();
    try { await loadDrives(); } catch (e) { setErr(e.message); }
    // First open lands on the caller-supplied current dir; fall back to Home.
    go(startDir || $("fm-drive").value || "");
  }

  window.filesOpen = filesOpen;
})();
