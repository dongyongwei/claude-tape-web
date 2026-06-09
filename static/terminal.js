const $ = (id) => document.getElementById(id);

const TRANSLATIONS = {
  en: {
    gate_sub:         "Enter server access token",
    gate_placeholder: "Access token",
    gate_remember:    "Remember token",
    gate_enter:       "Enter",
    gate_err_invalid: "Invalid token, please retry",
    gate_err_expired: "Saved token expired, please re-enter",
    gate_err_load:    "Load failed",
    sec_new_session:  "New Session",
    sec_history:      "History",
    btn_start:        "Start",
    btn_config:       "Config",
    btn_back:         "← Back",
    btn_cfg_back:     "← Back",
    cfg_title:        "Config",
    cfg_dirs_label:   "project_dirs (one per line)",
    cfg_models_label: "Models",
    cfg_add_model:    "+ Add model",
    cfg_import_model: "↑ Import",
    cfg_export_model: "↓ Export",
    cfg_import_err:   "Import failed",
    cfg_save:         "Save",
    cfg_apply:        "Apply",
    cfg_loading:      "Loading…",
    cfg_saving:       "Saving…",
    cfg_saved:        "Saved",
    cfg_save_err:     "Save failed",
    cfg_applying:     "Applying…",
    cfg_applied:      "Applied",
    cfg_apply_err:    "Apply failed",
    cfg_load_err:     "Config load failed",
    hdr_time:         "Time",
    hdr_model:        "Model",
    hdr_note:         "Note",
    sess_placeholder: "Unnamed",
    sess_activate:    "Activate",
    sess_more:        "More ▾",
    sess_close:       "Close",
    sess_save:        "Save",
    sess_cancel:      "Cancel",
    sess_delete:      "Delete",
    empty_history:    "No history",
    err_history:      "Failed to load history",
    default_dir:      "(default directory)",
    today_prefix:     "Today",
    not_connected:    "Not connected",
    connected:        "Connected",
    connected_resume: "Connected (resumed)",
    session_ended:    "Session ended",
    token_invalid:    "Invalid token",
    disconnected:     "Disconnected",
    reconnecting:     "Reconnecting…",
    spawn_error:      "Spawn error",
    update_failed:    "Update failed",
    confirm_delete:   "Delete this session?",
    confirm_cancel:   "Cancel",
    confirm_ok:       "Delete",
    confirm_back:        "Close all sessions and go back?",
    confirm_back_ok:     "Back",
    confirm_close_tab:   "Close this session?",
    confirm_close_tab_ok:"Close",
    rename_title:        "Rename Session",
    rename_save:         "Save",
    rename_cancel:       "Cancel",
    default_model:    "Claude (local login)",
    builtin_tag:      "Built-in",
    model_del:        "Delete",
    ntm_title:        "New Session",
    ntm_model:        "Model",
    ntm_project:      "Project",
    ntm_cancel:       "Cancel",
    ntm_start:        "Start",
    htm_title:        "Resume Session",
    htm_empty:        "No history",
    htm_open:         "Open",
    tab_rename:       "Rename",
    tab_model:        "Model",
    cloud_title:       "Cloud",
    cloud_unbound:     "Not connected",
    cloud_bound:       "Connected",
    cloud_base_url:    "Cloud server",
    cloud_connect:     "Connect",
    cloud_logout:      "Disconnect",
    cloud_enter_code:  "Confirm this code in your browser:",
    cloud_open_browser:"Open authorization page",
    cloud_waiting:     "Waiting for confirmation…",
    cloud_cancel:      "Cancel",
    cloud_connected_ok:"Connected to cloud",
    cloud_err:         "Cloud error",
  },
  zh: {
    gate_sub:         "请输入服务端访问令牌",
    gate_placeholder: "访问令牌",
    gate_remember:    "记住令牌",
    gate_enter:       "进入",
    gate_err_invalid: "令牌错误，请重试",
    gate_err_expired: "已保存令牌已失效，请重新输入",
    gate_err_load:    "加载失败",
    sec_new_session:  "新建会话",
    sec_history:      "历史记录",
    btn_start:        "开始",
    btn_config:       "配置",
    btn_back:         "← 返回",
    btn_cfg_back:     "← 返回",
    cfg_title:        "配置",
    cfg_dirs_label:   "project_dirs（一行一个）",
    cfg_models_label: "模型列表",
    cfg_add_model:    "+ 添加模型",
    cfg_import_model: "↑ 导入",
    cfg_export_model: "↓ 导出",
    cfg_import_err:   "导入失败",
    cfg_save:         "保存",
    cfg_apply:        "应用生效",
    cfg_loading:      "加载中…",
    cfg_saving:       "保存中…",
    cfg_saved:        "已保存",
    cfg_save_err:     "保存失败",
    cfg_applying:     "应用中…",
    cfg_applied:      "已应用生效",
    cfg_apply_err:    "应用失败",
    cfg_load_err:     "加载配置失败",
    hdr_time:         "时间",
    hdr_model:        "模型",
    hdr_note:         "备注",
    sess_placeholder: "未命名",
    sess_activate:    "激活",
    sess_more:        "更多 ▾",
    sess_close:       "断开",
    sess_save:        "保存",
    sess_cancel:      "取消",
    sess_delete:      "删除",
    empty_history:    "暂无历史会话",
    err_history:      "历史加载失败",
    default_dir:      "（默认目录）",
    today_prefix:     "今天",
    not_connected:    "未连接",
    connected:        "已连接",
    connected_resume: "已连接（恢复会话）",
    session_ended:    "会话已结束",
    token_invalid:    "令牌无效",
    disconnected:     "已断开",
    reconnecting:     "重连中…",
    spawn_error:      "启动失败",
    update_failed:    "更新失败",
    confirm_delete:   "确定要删除此会话吗？",
    confirm_cancel:   "取消",
    confirm_ok:       "删除",
    confirm_back:        "关闭所有会话并返回首页？",
    confirm_back_ok:     "返回",
    confirm_close_tab:   "关闭此会话？",
    confirm_close_tab_ok:"关闭",
    rename_title:        "重命名会话",
    rename_save:         "保存",
    rename_cancel:       "取消",
    default_model:    "官方 Claude（本机登录）",
    builtin_tag:      "内置",
    model_del:        "删除",
    ntm_title:        "新建会话",
    ntm_model:        "模型",
    ntm_project:      "项目目录",
    ntm_cancel:       "取消",
    ntm_start:        "开始",
    htm_title:        "恢复历史会话",
    htm_empty:        "暂无历史",
    htm_open:         "打开",
    tab_rename:       "重命名",
    tab_model:        "模型",
    cloud_title:       "云端",
    cloud_unbound:     "未连接",
    cloud_bound:       "已连接",
    cloud_base_url:    "云端服务器",
    cloud_connect:     "连接云端",
    cloud_logout:      "解绑",
    cloud_enter_code:  "请在浏览器确认此验证码：",
    cloud_open_browser:"打开授权页面",
    cloud_waiting:     "等待确认中…",
    cloud_cancel:      "取消",
    cloud_connected_ok:"已连接云端",
    cloud_err:         "云端错误",
  },
};

let _lang = localStorage.getItem("agent_lang") || "en";

function t(key) {
  return (TRANSLATIONS[_lang] || TRANSLATIONS.en)[key] || key;
}

function setLang(lang) {
  _lang = lang;
  localStorage.setItem("agent_lang", lang);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll(".lb[data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === _lang);
  });
  if (!$("home").classList.contains("hidden")) {
    if (_lastOpts) populate(_lastOpts);
    renderHistory();
  }
  if (!$("configview").classList.contains("hidden")) {
    renderModels(_lastCfgModels);
  }
  if (!$("termview").classList.contains("hidden")) {
    const activeTab = getActiveTab();
    if (activeTab) {
      $("status").textContent = t(activeTab.statusKey);
    }
  }
}

let token = new URLSearchParams(location.search).get("token") || "";
let _lastOpts = null;
let _lastCfgModels = [];
let _extraModels = [];

// ---------- Multi-tab state ----------
let _tabs = [];
let _activeTabId = null;
let _tabCounter = 0;

const _MAX_RECONNECT = 8;
const _HEARTBEAT_MS = 30_000;

function _allModels() { return [{ id: "", name: t("default_model") }, ..._extraModels]; }

function getActiveTab() {
  return _tabs.find((tab) => tab.id === _activeTabId) || null;
}

function tokenQs() {
  return token ? `?token=${encodeURIComponent(token)}` : "";
}

// ---------- Token Gate → Home ----------
async function fetchOptions(tok) {
  const r = await fetch(`/api/project-dirs?token=${encodeURIComponent(tok)}`);
  if (r.status === 401) throw new Error(t("gate_err_invalid"));
  if (!r.ok) throw new Error(t("gate_err_load"));
  const dirs = await r.json();
  const models = await fetch(`/api/models?token=${encodeURIComponent(tok)}`).then((r) => r.json());
  return { dirs, models };
}

function populate({ dirs, models }) {
  _lastOpts = { dirs, models };
  _extraModels = models || [];
  const modelSel = $("model");
  modelSel.style.display = "";
  modelSel.innerHTML = _allModels().map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("");
  $("cwd").innerHTML = dirs.map((d) => `<option value="${d}">${d}</option>`).join("");
}

async function enter(tok) {
  const opts = await fetchOptions(tok);
  token = tok;
  populate(opts);
  $("gate").classList.add("hidden");
  showHome();
}

$("enter").onclick = () => {
  $("gate-err").textContent = "";
  const tok = $("token-input").value.trim();
  enter(tok).then(() => {
    if ($("remember-token").checked) localStorage.setItem("agent_token", tok);
    else localStorage.removeItem("agent_token");
  }).catch((e) => {
    $("gate-err").textContent = e.message;
  });
};
$("token-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("enter").click();
});

{
  const saved = localStorage.getItem("agent_token");
  const init = saved || token;
  if (saved) $("remember-token").checked = true;
  if (init) {
    enter(init).catch(() => {
      if (saved) localStorage.removeItem("agent_token");
      $("token-input").value = init;
      $("gate-err").textContent = saved ? t("gate_err_expired") : t("gate_err_invalid");
    });
  }
}

// ---------- Utilities ----------
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

async function patchSession(sid, body) {
  const r = await fetch(`/api/sessions/${encodeURIComponent(sid)}${tokenQs()}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(t("update_failed"));
}

// ---------- Confirm Dialog ----------
function showConfirm(msg, { okLabel, cancelLabel } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `<div class="confirm-card">
      <div class="confirm-msg">${esc(msg)}</div>
      <div class="confirm-actions">
        <button class="confirm-cancel">${esc(cancelLabel || t("confirm_cancel"))}</button>
        <button class="confirm-ok">${esc(okLabel || t("confirm_ok"))}</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    const done = (v) => { overlay.remove(); resolve(v); };
    overlay.querySelector(".confirm-cancel").onclick = () => done(false);
    overlay.querySelector(".confirm-ok").onclick = () => done(true);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) done(false); });
    const onKey = (e) => {
      if (e.key === "Escape") { done(false); document.removeEventListener("keydown", onKey); }
    };
    document.addEventListener("keydown", onKey);
    overlay.querySelector(".confirm-ok").focus();
  });
}

// ---------- Home: History ----------
function fmtWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const hm = d.toTimeString().slice(0, 5);
  if (sameDay) return `${t("today_prefix")} ${hm}`;
  const md = `${d.getMonth() + 1}/${d.getDate()}`;
  return `${md} ${hm}`;
}

async function showHome() {
  $("termview").classList.add("hidden");
  $("configview").classList.add("hidden");
  $("home").classList.remove("hidden");
  await renderHistory();
}

async function renderHistory() {
  const box = $("history");
  let groups = [];
  try {
    groups = await fetch(`/api/sessions${tokenQs()}`).then((r) => r.json());
  } catch (e) {
    box.innerHTML = `<div class="empty">${t("err_history")}</div>`;
    return;
  }
  if (!groups.length) {
    box.innerHTML = `<div class="empty">${t("empty_history")}</div>`;
    return;
  }

  box.innerHTML = groups.map((g, gi) => {
    const rows = g.sessions.map((s) => {
      const tag = s.tag || "";
      const modelId = s.model_id || "";
      const modelOpts = _allModels().map((m) =>
        `<option value="${esc(m.id)}"${m.id === modelId ? " selected" : ""}>${esc(m.name)}</option>`
      ).join("");
      return `<div class="sess">
        <span class="dot ${s.status === "active" ? "active" : "closed"}"></span>
        <span class="when">${esc(fmtWhen(s.last_active_at))}</span>
        <select class="m-select" data-sid="${esc(s.sid)}">${modelOpts}</select>
        <div class="tag-input-wrap">
          <textarea class="tag-input" placeholder="${t('sess_placeholder')}" rows="1"
            data-sid="${esc(s.sid)}" data-orig="${esc(tag)}">${esc(tag)}</textarea>
          <div class="tag-btns">
            <button class="pk-ok">${t("sess_save")}</button>
            <button class="pk-cancel">${t("sess_cancel")}</button>
          </div>
        </div>
        <span class="spacer"></span>
        <button class="act" data-act="${esc(s.sid)}" data-cwd="${esc(s.cwd)}"
          data-model="${esc(s.model_id || "")}" data-orig-model="${esc(s.model_id || "")}"
          data-status="${esc(s.status)}" data-tag="${esc(tag)}">${t("sess_activate")}</button>
        <div class="more-wrap">
          <button class="more-btn">${t("sess_more")}</button>
          <div class="more-drop hidden">
            ${s.status === "active" ? `<button class="mi-close" data-sid="${esc(s.sid)}">${t("sess_close")}</button><div class="more-sep"></div>` : ""}
            <button class="mi-del" data-sid="${esc(s.sid)}">${t("sess_delete")}</button>
          </div>
        </div>
      </div>`;
    }).join("");
    const label = g.cwd || t("default_dir");
    return `<div class="grp">
      <div class="grp-head" data-grp="${gi}">
        <span class="caret">▾</span>
        <span class="path">${esc(label)}</span>
        <span class="count">${g.sessions.length}</span>
      </div>
      <div class="grp-body">
        <div class="sess-hdr">
          <span class="hdr-dot"></span>
          <span class="hdr-when">${t("hdr_time")}</span>
          <span class="hdr-model">${t("hdr_model")}</span>
          <span class="hdr-tag">${t("hdr_note")}</span>
        </div>
        ${rows}
      </div>
    </div>`;
  }).join("");

  box.querySelectorAll(".grp-head").forEach((h) => {
    h.onclick = () => {
      const body = h.nextElementSibling;
      const hidden = body.classList.toggle("hidden");
      h.querySelector(".caret").textContent = hidden ? "▸" : "▾";
    };
  });

  box.querySelectorAll("button.act").forEach((b) => {
    b.onclick = async () => {
      const sid = b.dataset.act;
      const modelChanged = b.dataset.model !== b.dataset.origModel;
      // An active session re-attaches to its already-running process, which keeps
      // the model it was spawned with. To apply a freshly-picked model we must kill
      // it first so the resume path respawns Claude with the new --model.
      if (b.dataset.status === "active" && modelChanged) {
        await fetch(`/api/sessions/${encodeURIComponent(sid)}/close${tokenQs()}`, { method: "POST" }).catch(() => {});
      }
      connect({
        resume: sid,
        cwd: b.dataset.cwd || undefined,
        model_id: b.dataset.model || undefined,
        label: b.dataset.tag || undefined,
      });
    };
  });

  box.querySelectorAll(".more-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const drop = btn.nextElementSibling;
      const wasOpen = !drop.classList.contains("hidden");
      closeAllMenus();
      if (!wasOpen) drop.classList.remove("hidden");
    };
  });

  box.querySelectorAll(".m-select").forEach((sel) => {
    sel.dataset.prevIndex = String(sel.selectedIndex);
    sel.addEventListener("change", async () => {
      const sid = sel.dataset.sid;
      const newId = sel.value;
      const newName = sel.options[sel.selectedIndex].text;
      try {
        await patchSession(sid, { model_id: newId, model_name: newName });
        sel.dataset.prevIndex = String(sel.selectedIndex);
        const row = sel.closest(".sess");
        if (row) row.querySelector("button.act").dataset.model = newId;
      } catch (_) {
        sel.selectedIndex = parseInt(sel.dataset.prevIndex) || 0;
      }
    });
  });

  box.querySelectorAll(".tag-input").forEach((inp) => {
    const btns = inp.nextElementSibling;
    const ok = btns.querySelector(".pk-ok");
    const cancelBtn = btns.querySelector(".pk-cancel");

    const autoGrow = () => {
      inp.style.height = "auto";
      inp.style.height = inp.scrollHeight + "px";
    };
    inp.addEventListener("input", autoGrow);
    autoGrow();

    ok.addEventListener("mousedown", (e) => e.preventDefault());
    cancelBtn.addEventListener("mousedown", (e) => e.preventDefault());

    const save = async () => {
      const newTag = inp.value.trim();
      try {
        await patchSession(inp.dataset.sid, { tag: newTag });
        inp.dataset.orig = newTag;
        inp.value = newTag;
        autoGrow();
      } catch (_) {
        inp.value = inp.dataset.orig;
        autoGrow();
      }
      inp.blur();
    };

    const cancel = () => {
      inp.value = inp.dataset.orig;
      autoGrow();
      inp.blur();
    };

    ok.onclick = save;
    cancelBtn.onclick = cancel;

    inp.addEventListener("focus", () => btns.classList.add("visible"));
    inp.addEventListener("blur", () => {
      inp.value = inp.dataset.orig;
      autoGrow();
      btns.classList.remove("visible");
    });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.preventDefault(); cancel(); }
    });
  });

  box.querySelectorAll(".mi-del").forEach((item) => {
    item.onclick = async () => {
      closeAllMenus();
      const confirmed = await showConfirm(t("confirm_delete"));
      if (!confirmed) return;
      await fetch(`/api/sessions/${encodeURIComponent(item.dataset.sid)}${tokenQs()}`, { method: "DELETE" });
      renderHistory();
    };
  });

  box.querySelectorAll(".mi-close").forEach((item) => {
    item.onclick = async () => {
      closeAllMenus();
      const sid = item.dataset.sid;
      const tab = _tabs.find((tb) => tb.sid === sid);
      if (tab) {
        tab.intentionalClose = true;
        clearTimeout(tab.reconnectTimer);
        clearInterval(tab.heartbeat);
        if (tab.ws) { try { tab.ws.close(); } catch (_) {} }
      }
      await fetch(`/api/sessions/${encodeURIComponent(sid)}/close${tokenQs()}`, { method: "POST" }).catch(() => {});
      renderHistory();
    };
  });
}

// ---------- Tab Management ----------
// Derive a tab label from a session NOTE/tag: first line, truncated with "…".
function tabLabelFromTag(tag, fallback) {
  const s = (tag || "").replace(/\s+/g, " ").trim();
  if (!s) return fallback;
  return s.length > 24 ? s.slice(0, 24) + "…" : s;
}

function createTabSession() {
  const id = ++_tabCounter;
  const panel = document.createElement("div");
  panel.className = "term-panel hidden";
  panel.dataset.tabId = String(id);
  $("term-container").appendChild(panel);

  const terminal = new Terminal({
    fontSize: 14,
    fontFamily: "Consolas, 'Courier New', monospace",
    cursorBlink: true,
    theme: { background: "#1e1e1e" },
  });
  const fitAddon = new FitAddon.FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(panel);

  const tab = {
    id,
    label: `Session ${id}`,
    panel,
    terminal,
    fitAddon,
    ws: null,
    sid: null,
    model_id: "",
    connectOpts: null,
    intentionalClose: false,
    reconnectTimer: null,
    reconnectCount: 0,
    statusKey: "not_connected",
    statusColor: "",
    heartbeat: null,
  };

  terminal.onData((d) => {
    if (tab.ws && tab.ws.readyState === WebSocket.OPEN) {
      tab.ws.send(JSON.stringify({ type: "input", data: d }));
    }
  });

  _tabs.push(tab);
  return tab;
}

function setTabStatus(tab, key, color) {
  tab.statusKey = key;
  tab.statusColor = color || "";
  if (tab.id === _activeTabId) {
    $("status").textContent = t(key);
    $("status").style.color = tab.statusColor;
  }
}

function activateTab(id) {
  const prev = getActiveTab();
  if (prev && prev.id !== id) {
    prev.panel.classList.add("hidden");
  }
  _activeTabId = id;
  const tab = getActiveTab();
  if (tab) {
    tab.panel.classList.remove("hidden");
    tab.fitAddon.fit();
    $("status").textContent = t(tab.statusKey);
    $("status").style.color = tab.statusColor;
  }
  renderTabStrip();
}

function closeTab(id) {
  const idx = _tabs.findIndex((tab) => tab.id === id);
  if (idx === -1) return;
  const tab = _tabs[idx];

  tab.intentionalClose = true;
  clearTimeout(tab.reconnectTimer);
  clearInterval(tab.heartbeat);
  if (tab.ws) { try { tab.ws.close(); } catch (e) {} }
  tab.terminal.dispose();
  tab.panel.remove();
  _tabs.splice(idx, 1);

  if (_tabs.length === 0) {
    $("termview").classList.add("hidden");
    showHome();
    return;
  }

  if (_activeTabId === id) {
    const newIdx = Math.min(idx, _tabs.length - 1);
    activateTab(_tabs[newIdx].id);
  } else {
    renderTabStrip();
  }
}

function renderTabStrip() {
  const strip = $("tab-strip");
  strip.innerHTML = _tabs.map((tab) => {
    const active = tab.id === _activeTabId ? " active" : "";
    return `<div class="tab-btn${active}" data-tab-id="${tab.id}">
      <span class="tab-label">${esc(tab.label)}</span>
      <button class="tab-more-btn" data-tab-more="${tab.id}">▾</button>
      <button class="tab-close" data-close-tab="${tab.id}">×</button>
    </div>`;
  }).join("");
}

function startRenameTab(id) {
  const tab = _tabs.find((tb) => tb.id === id);
  if (!tab) return;

  const modal = $("rnm");
  const input = $("rnm-input");
  const saveBtn = $("rnm-save");
  const cancelBtn = $("rnm-cancel");

  $("rnm-title").textContent = t("rename_title");
  saveBtn.textContent   = t("rename_save");
  cancelBtn.textContent = t("rename_cancel");
  input.value = tab.label;

  modal.classList.remove("hidden");
  requestAnimationFrame(() => { input.focus(); input.select(); });

  const close = (save) => {
    modal.classList.add("hidden");
    saveBtn.removeEventListener("click", onSave);
    cancelBtn.removeEventListener("click", onCancel);
    input.removeEventListener("keydown", onKey);
    modal.removeEventListener("click", onOverlay);
    if (save) {
      const newLabel = input.value.trim() || tab.label;
      if (newLabel !== tab.label) {
        tab.label = newLabel;
        if (tab.sid) patchSession(tab.sid, { tag: newLabel }).catch(() => {});
        renderTabStrip();
      }
    }
  };

  const onSave    = () => close(true);
  const onCancel  = () => close(false);
  const onKey     = (e) => {
    if (e.key === "Enter")  { e.preventDefault(); close(true); }
    if (e.key === "Escape") { e.preventDefault(); close(false); }
  };
  const onOverlay = (e) => { if (e.target === modal) close(false); };

  saveBtn.addEventListener("click", onSave);
  cancelBtn.addEventListener("click", onCancel);
  input.addEventListener("keydown", onKey);
  modal.addEventListener("click", onOverlay);
}

// ---------- Tab Strip — delegated handlers (wired once, survive innerHTML resets) ----------
(function() {
  const strip = $("tab-strip");

  strip.addEventListener("click", (e) => {
    if (e.target.tagName === "INPUT") return;

    const moreBtn = e.target.closest(".tab-more-btn");
    if (moreBtn) {
      e.stopPropagation();
      const tabId = parseInt(moreBtn.dataset.tabMore);
      const drop = $("tab-more-drop");
      const wasOpen = !drop.classList.contains("hidden") && drop.dataset.forTab == tabId;
      closeAllMenus();
      if (!wasOpen) openTabMoreDrop(tabId, moreBtn);
      return;
    }

    const closeBtn = e.target.closest(".tab-close");
    if (closeBtn) {
      const tabId = parseInt(closeBtn.dataset.closeTab);
      showConfirm(t("confirm_close_tab"), { okLabel: t("confirm_close_tab_ok") })
        .then((ok) => { if (ok) closeTab(tabId); });
      return;
    }

    const btn = e.target.closest(".tab-btn");
    if (btn) activateTab(parseInt(btn.dataset.tabId));
  });
})();

// ---------- Tab More Dropdown ----------
function openTabMoreDrop(tabId, anchorBtn) {
  const tab = _tabs.find((tb) => tb.id === tabId);
  if (!tab) return;
  const drop = $("tab-more-drop");
  drop.dataset.forTab = String(tabId);

  const modelOpts = _allModels().map((m) =>
    `<option value="${esc(m.id)}"${m.id === (tab.model_id || "") ? " selected" : ""}>${esc(m.name)}</option>`
  ).join("");

  drop.innerHTML = `
    <div class="tab-more-model-row">
      <span>${t("tab_model")}</span>
      <select data-prev-model="${esc(tab.model_id || "")}">${modelOpts}</select>
    </div>
    <div class="tab-more-sep"></div>
    <button class="tmi">${t("tab_rename")}</button>`;

  drop.querySelector("select").addEventListener("change", async function() {
    const newId = this.value;
    const newName = this.options[this.selectedIndex].text;
    const prevModel = this.dataset.prevModel;
    closeAllMenus();
    try {
      if (tab.sid) await patchSession(tab.sid, { model_id: newId, model_name: newName });
      tab.model_id = newId;
      if (tab.sid) {
        await fetch(`/api/sessions/${encodeURIComponent(tab.sid)}/close${tokenQs()}`, { method: "POST" }).catch(() => {});
        tab.intentionalClose = true;
        clearTimeout(tab.reconnectTimer);
        clearInterval(tab.heartbeat);
        if (tab.ws) { try { tab.ws.close(); } catch (_) {} }
        connectTab(tab, { ...tab.connectOpts, resume: tab.sid, model_id: newId });
      }
    } catch (_) {
      this.value = prevModel;
      tab.model_id = prevModel;
    }
  });

  drop.querySelector(".tmi").onclick = () => {
    closeAllMenus();
    startRenameTab(tabId);
  };

  // Position dropdown anchored below the button, right-aligned
  const rect = anchorBtn.getBoundingClientRect();
  const barRect = $("bar").getBoundingClientRect();
  drop.style.top = (rect.bottom - barRect.top + 4) + "px";
  drop.style.right = Math.max(0, barRect.right - rect.right) + "px";
  drop.style.left = "auto";
  drop.classList.remove("hidden");
}

// Prevent clicks inside the dropdown from bubbling to document (would close it)
$("tab-more-drop").addEventListener("click", (e) => e.stopPropagation());

function sendToTab(tab, obj) {
  if (tab.ws && tab.ws.readyState === WebSocket.OPEN) {
    tab.ws.send(JSON.stringify(obj));
  }
}

function scheduleReconnect(tab) {
  if (tab.reconnectCount >= _MAX_RECONNECT) {
    setTabStatus(tab, "disconnected", "#e57373");
    return;
  }
  tab.reconnectCount++;
  const delay = Math.min(1000 * Math.pow(2, tab.reconnectCount - 1), 30_000);
  setTabStatus(tab, "reconnecting", "#ff9800");
  tab.reconnectTimer = setTimeout(() => {
    if ($("termview").classList.contains("hidden")) {
      tab.reconnectCount = 0;
      return;
    }
    connectTab(tab, { ...tab.connectOpts, resume: tab.sid || tab.connectOpts?.resume });
  }, delay);
}

function connectTab(tab, opts) {
  clearTimeout(tab.reconnectTimer);
  clearInterval(tab.heartbeat);
  tab.intentionalClose = false;
  tab.connectOpts = opts;
  tab.model_id = opts.model_id || "";
  tab.terminal.clear();

  if (!tab.panel.classList.contains("hidden")) {
    tab.fitAddon.fit();
  }

  const proto = location.protocol === "https:" ? "wss" : "ws";
  tab.ws = new WebSocket(`${proto}://${location.host}/ws/term${tokenQs()}`);
  tab.ws.binaryType = "arraybuffer";

  tab.ws.onopen = () => {
    tab.reconnectCount = 0;
    setTabStatus(tab, opts.resume ? "connected_resume" : "connected", "#4caf50");
    if (!tab.panel.classList.contains("hidden")) tab.fitAddon.fit();
    sendToTab(tab, {
      type: "spawn",
      resume: opts.resume,
      model_id: opts.model_id,
      cwd: opts.cwd,
      cols: tab.terminal.cols,
      rows: tab.terminal.rows,
    });
    tab.heartbeat = setInterval(() => sendToTab(tab, { type: "ping" }), _HEARTBEAT_MS);
  };

  tab.ws.onmessage = (ev) => {
    if (typeof ev.data === "string") {
      const msg = JSON.parse(ev.data);
      if (msg.type === "spawned") {
        tab.sid = msg.sid;
      } else if (msg.type === "spawn_error") {
        tab.terminal.write(`\r\n[${t("spawn_error")}] ${msg.error}\r\n`);
      } else if (msg.type === "closed") {
        setTabStatus(tab, "session_ended", "#e57373");
      }
      return;
    }
    tab.terminal.write(new Uint8Array(ev.data));
  };

  tab.ws.onclose = (ev) => {
    clearInterval(tab.heartbeat);
    if (ev.code === 4003) {
      setTabStatus(tab, "token_invalid", "#e57373");
      return;
    }
    if (tab.intentionalClose) {
      setTabStatus(tab, "disconnected", "#e57373");
      return;
    }
    scheduleReconnect(tab);
  };
}

function connect(opts) {
  $("home").classList.add("hidden");
  $("termview").classList.remove("hidden");
  const tab = createTabSession();
  if (opts && opts.label) tab.label = tabLabelFromTag(opts.label, tab.label);
  activateTab(tab.id);
  connectTab(tab, opts);
}

// ---------- Back Button ----------
$("back").onclick = async () => {
  const confirmed = await showConfirm(t("confirm_back"), { okLabel: t("confirm_back_ok") });
  if (!confirmed) return;
  [..._tabs].forEach((tab) => {
    tab.intentionalClose = true;
    clearTimeout(tab.reconnectTimer);
    clearInterval(tab.heartbeat);
    if (tab.ws) { try { tab.ws.close(); } catch (e) {} }
    tab.terminal.dispose();
    tab.panel.remove();
  });
  _tabs = [];
  _activeTabId = null;
  $("tab-strip").innerHTML = "";
  $("termview").classList.add("hidden");
  showHome();
};

$("start").onclick = () => connect({
  model_id: $("model").value || undefined,
  cwd: $("cwd").value || undefined,
});

// ---------- New Tab Modal ----------
$("tab-add").onclick = () => {
  if (_lastOpts) {
    $("ntm-model").innerHTML = _allModels().map((m) =>
      `<option value="${esc(m.id)}">${esc(m.name)}</option>`
    ).join("");
    $("ntm-cwd").innerHTML = (_lastOpts.dirs || []).map((d) =>
      `<option value="${d}">${d}</option>`
    ).join("");
  }
  $("ntm").classList.remove("hidden");
};

$("ntm-cancel").onclick = () => $("ntm").classList.add("hidden");
$("ntm").addEventListener("click", (e) => {
  if (e.target === $("ntm")) $("ntm").classList.add("hidden");
});

// ---------- History Tab Modal ----------
$("tab-resume").onclick = async () => {
  let groups = [];
  try {
    groups = await fetch(`/api/sessions${tokenQs()}`).then((r) => r.json());
  } catch (_) {}

  const list = $("htm-list");
  const sessions = groups.flatMap((g) => g.sessions);

  if (!sessions.length) {
    list.innerHTML = `<div class="empty">${t("htm_empty")}</div>`;
  } else {
    list.innerHTML = sessions.map((s) => `
      <div class="htm-row">
        <span class="dot ${s.status === "active" ? "active" : "closed"}"></span>
        <span class="when">${esc(fmtWhen(s.last_active_at))}</span>
        <span class="htm-tag">${esc(s.tag || s.cwd || s.sid.slice(0, 8))}</span>
        <button class="htm-open" data-sid="${esc(s.sid)}"
          data-cwd="${esc(s.cwd || "")}" data-tag="${esc(s.tag || "")}"
          data-model="${esc(s.model_id || "")}">${t("htm_open")}</button>
      </div>`).join("");

    list.querySelectorAll(".htm-open").forEach((btn) => {
      btn.onclick = () => {
        $("htm").classList.add("hidden");
        const tab = createTabSession();
        tab.label = tabLabelFromTag(btn.dataset.tag, tab.label);
        activateTab(tab.id);
        connectTab(tab, {
          resume: btn.dataset.sid,
          cwd: btn.dataset.cwd || undefined,
          model_id: btn.dataset.model || undefined,
        });
      };
    });
  }

  $("htm").classList.remove("hidden");
};

$("htm-cancel").onclick = () => $("htm").classList.add("hidden");
$("htm").addEventListener("click", (e) => {
  if (e.target === $("htm")) $("htm").classList.add("hidden");
});
$("ntm-start").onclick = () => {
  $("ntm").classList.add("hidden");
  const tab = createTabSession();
  activateTab(tab.id);
  connectTab(tab, {
    model_id: $("ntm-model").value || undefined,
    cwd: $("ntm-cwd").value || undefined,
  });
};

// ---------- Config View ----------
function cfgStatus(text, color) {
  $("cfg-status").textContent = text || "";
  $("cfg-status").style.color = color || "#888";
}

function builtinModelRow() {
  return `<tr class="cfg-model-row builtin" data-builtin="1" data-id="1">
    <td style="text-align:center;color:#555;font-size:12px;">1</td>
    <td><input class="m-name" value="${esc(t("default_model"))}" disabled /></td>
    <td><input class="m-model" placeholder="api_model" value="" disabled /></td>
    <td><input class="m-base" value="" disabled /></td>
    <td><input class="m-auth" value="" disabled /></td>
    <td><span class="cfg-builtin-tag">${t("builtin_tag")}</span></td>
  </tr>`;
}

function nextModelId() {
  const rows = [...$("cfg-models").querySelectorAll(".cfg-model-row:not([data-builtin])")];
  const max = rows.reduce((m, r) => Math.max(m, parseInt(r.dataset.id) || 1), 1);
  return String(max + 1);
}

function modelRowHtml(m) {
  m = m || {};
  const id = m.id || "";
  return `<tr class="cfg-model-row" data-id="${esc(id)}">
    <td style="text-align:center;color:#888;font-size:12px;padding:0 8px;">${esc(id)}</td>
    <td><input class="m-name" placeholder="name" value="${esc(m.name)}" /></td>
    <td><input class="m-model" placeholder="api_model" value="${esc(m.model)}" /></td>
    <td><input class="m-base" placeholder="base_url" value="${esc(m.base_url)}" /></td>
    <td><input class="m-auth" placeholder="auth_token" value="${esc(m.auth_token)}" /></td>
    <td><button class="m-del">${t("model_del")}</button></td>
  </tr>`;
}

function bindModelDel() {
  $("cfg-models").querySelectorAll(".m-del").forEach((b) => {
    b.onclick = () => b.closest(".cfg-model-row").remove();
  });
}

function renderModels(models) {
  _lastCfgModels = models || [];
  const numbered = (models || []).map((m, i) => ({ ...m, id: String(i + 2) }));
  $("cfg-models").innerHTML = `<table class="cfg-model-table">
    <thead><tr>
      <th>#</th><th>name</th><th>api_model</th><th>base_url</th><th>auth_token</th><th></th>
    </tr></thead>
    <tbody>${builtinModelRow()}${numbered.map(modelRowHtml).join("")}</tbody>
  </table>`;
  bindModelDel();
}

async function showConfig() {
  $("home").classList.add("hidden");
  $("termview").classList.add("hidden");
  $("configview").classList.remove("hidden");
  cfgStatus(t("cfg_loading"));
  const cfg = await fetch(`/api/config${tokenQs()}`).then((r) => {
    if (!r.ok) throw new Error(t("cfg_load_err"));
    return r.json();
  });
  $("cfg-claude-bin").value = cfg.claude_bin || "";
  $("cfg-token").value = cfg.access_token || "";
  $("cfg-dirs").value = (cfg.project_dirs || []).join("\n");
  renderModels(cfg.models);
  _lastCfgModels = cfg.models || [];
  await loadCloudStatus();
  cfgStatus("");
}

function collectConfig() {
  const dirs = $("cfg-dirs").value.split(/[\n;,]/).map((s) => s.trim()).filter(Boolean);
  const models = [...$("cfg-models").querySelectorAll(".cfg-model-row:not([data-builtin])")].map((row) => ({
    id: row.dataset.id,
    name: row.querySelector(".m-name").value.trim(),
    model: row.querySelector(".m-model").value.trim(),
    base_url: row.querySelector(".m-base").value.trim(),
    auth_token: row.querySelector(".m-auth").value.trim(),
  })).filter((m) => m.id);
  return {
    claude_bin: $("cfg-claude-bin").value.trim() || "claude",
    access_token: $("cfg-token").value.trim(),
    project_dirs: dirs,
    models,
  };
}

$("config").onclick = () => showConfig().catch((e) => cfgStatus(e.message, "#e57373"));
$("cfg-back").onclick = () => { stopCloudPoll(); showHome(); };
$("cfg-add-model").onclick = () => {
  const tbody = $("cfg-models").querySelector("tbody");
  if (tbody) { tbody.insertAdjacentHTML("beforeend", modelRowHtml({ id: nextModelId() })); bindModelDel(); }
};

$("cfg-export-model").onclick = () => {
  const models = collectConfig().models;
  const blob = new Blob([JSON.stringify(models, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "models.json";
  a.click();
  URL.revokeObjectURL(a.href);
};

$("cfg-import-model").onclick = () => $("cfg-import-file").click();

$("cfg-import-file").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      let data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) data = data.models || [];
      const tbody = $("cfg-models").querySelector("tbody");
      if (tbody) {
        data.forEach((m) => tbody.insertAdjacentHTML("beforeend", modelRowHtml({ ...m, id: nextModelId() })));
        bindModelDel();
      }
    } catch (err) {
      cfgStatus(t("cfg_import_err") + ": " + err.message, "#e57373");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
};

$("cfg-save").onclick = async () => {
  cfgStatus(t("cfg_saving"));
  try {
    const r = await fetch(`/api/config${tokenQs()}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectConfig()),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || t("cfg_save_err"));
    cfgStatus(t("cfg_saved"), "#4caf50");
  } catch (e) {
    cfgStatus(e.message, "#e57373");
  }
};

$("cfg-apply").onclick = async () => {
  cfgStatus(t("cfg_applying"));
  const data = collectConfig();
  try {
    const r = await fetch(`/api/config/apply${tokenQs()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || t("cfg_apply_err"));
    if (data.access_token !== token) token = data.access_token;
    try { populate(await fetchOptions(token)); } catch (e) {}
    cfgStatus(t("cfg_applied"), "#4caf50");
  } catch (e) {
    cfgStatus(e.message, "#e57373");
  }
};

// ---------- Cloud ----------
let _cloudPoll = null;

async function loadCloudStatus() {
  try {
    const s = await fetch(`/api/cloud/status${tokenQs()}`).then((r) => r.json());
    $("cloud-base-url").value = s.base_url || "";
    const bound = !!s.bound;
    $("cloud-dot").classList.toggle("on", bound);
    $("cloud-status-text").textContent = t(bound ? "cloud_bound" : "cloud_unbound");
    $("cloud-logout").style.display = s.configured ? "" : "none";
  } catch (e) { /* offline/unconfigured: keep unconnected state */ }
}

function stopCloudPoll() {
  if (_cloudPoll) { clearInterval(_cloudPoll); _cloudPoll = null; }
}

$("cloud-connect").onclick = async () => {
  // Save possibly-changed base_url first
  const url = $("cloud-base-url").value.trim();
  if (url) await fetch(`/api/cloud/base-url${tokenQs()}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_url: url }),
  }).catch(() => {});

  const r = await fetch(`/api/cloud/device/start${tokenQs()}`, { method: "POST" });
  if (!r.ok) { cfgStatus(t("cloud_err"), "#e57373"); return; }
  const d = await r.json();
  $("cloud-usercode").textContent = d.user_code;
  const link = $("cloud-open-link");
  link.href = d.verification_uri_complete || "#";
  $("cloud-authbox").classList.remove("hidden");
  if (d.verification_uri_complete) window.open(d.verification_uri_complete, "_blank", "noopener");

  const interval = Math.max(2, (d.interval || 3)) * 1000;
  stopCloudPoll();
  _cloudPoll = setInterval(async () => {
    const p = await fetch(`/api/cloud/device/poll${tokenQs()}`, { method: "POST" })
      .then((x) => x.json()).catch(() => ({ status: "error" }));
    if (p.status === "approved") {
      stopCloudPoll();
      $("cloud-authbox").classList.add("hidden");
      cfgStatus(t("cloud_connected_ok"), "#4caf50");
      await loadCloudStatus();
    } else if (p.status === "error" || p.status === "consumed") {
      stopCloudPoll();
      $("cloud-authbox").classList.add("hidden");
      cfgStatus(t("cloud_err"), "#e57373");
    }
  }, interval);
};

$("cloud-auth-cancel").onclick = () => {
  stopCloudPoll();
  $("cloud-authbox").classList.add("hidden");
};

$("cloud-logout").onclick = async () => {
  await fetch(`/api/cloud/logout${tokenQs()}`, { method: "POST" }).catch(() => {});
  await loadCloudStatus();
};

// ---------- Resize ----------
window.addEventListener("resize", () => {
  const tab = getActiveTab();
  if (!tab) return;
  tab.fitAddon.fit();
  sendToTab(tab, { type: "resize", cols: tab.terminal.cols, rows: tab.terminal.rows });
});

// ---------- Menus ----------
function closeAllMenus() {
  document.querySelectorAll(".more-drop").forEach((d) => d.classList.add("hidden"));
  $("tab-more-drop").classList.add("hidden");
}
document.addEventListener("click", closeAllMenus);

// ---------- Language Switcher ----------
document.querySelectorAll(".lb[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

setLang(_lang);
