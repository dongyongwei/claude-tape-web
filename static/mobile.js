const $ = (id) => document.getElementById(id);

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// ---------- i18n (shares desktop keys + a few mobile-only ones) ----------
const TRANSLATIONS = {
  en: {
    gate_sub:"Enter server access token", gate_placeholder:"Access token",
    gate_remember:"Remember token", gate_enter:"Enter",
    gate_err_invalid:"Invalid token, please retry",
    gate_err_expired:"Saved token expired, please re-enter", gate_err_load:"Load failed",
    sec_new_session:"New Session", sec_history:"History",
    btn_start:"Start", btn_config:"Config", btn_logout:"Logout",
    logout_confirm:"Log out and clear the saved token from this browser?",
    etm_title:"External Access",
    etm_warn:"Anyone with the share link can access your local terminal. Share privately; turn off to revoke.",
    etm_off:"Off", etm_connecting:"Connecting…", etm_online:"Online", etm_error:"Error",
    etm_enable:"Enable external access", etm_disable:"Turn off",
    etm_hint:"Open the URL, then enter the access token below at the login screen.",
    etm_url_pc:"Desktop URL", etm_url_mobile:"Mobile URL (/m)", etm_token:"Access token",
    etm_copy:"Copy", etm_copied:"Copied", etm_copy_all:"Copy all (URLs + token)",
    etm_copied_all:"All copied", etm_refresh:"↻",
    etm_qr_pc:"Scan to open (desktop)", etm_qr_mobile:"Scan to open (mobile)",
    etm_qr_token:"Scan for token", etm_saved:"Saved", etm_close:"Close",
    tab_home:"Home", tab_config:"Config", tab_ext:"External",
    cfg_frp_title:"External Access (frp server)", cfg_frp_save:"Save server settings",
    cfg_frp_saved:"Server settings saved",
    cfg_token_reset:"Reset & kick all",
    cfg_token_reset_confirm:"Reset the access token and disconnect ALL logged-in clients? They will need to re-enter the new token.",
    cfg_token_resetting:"Resetting…", cfg_token_reset_done:"Token reset — kicked {n} connection(s)",
    cfg_title:"Config", cfg_dirs_label:"project_dirs (one per line)",
    cfg_models_label:"Models", cfg_add_model:"+ Add model",
    cfg_import_model:"↑ Import", cfg_export_model:"↓ Export", cfg_import_err:"Import failed",
    cfg_import_all:"↑ Import All", cfg_export_all:"↓ Export All", cfg_import_all_err:"Import failed",
    cfg_import_done:"Imported — review and Save",
    cfg_pick_title_export:"Select sections to export", cfg_pick_title_import:"Select sections to import",
    cfg_pick_all:"All", cfg_pick_ok:"OK", cfg_pick_cancel:"Cancel",
    cfg_save:"Save", cfg_apply:"Apply",
    cfg_loading:"Loading…", cfg_saving:"Saving…", cfg_saved:"Saved", cfg_save_err:"Save failed",
    cfg_applying:"Applying…", cfg_applied:"Applied", cfg_apply_err:"Apply failed",
    cfg_load_err:"Config load failed",
    hdr_time:"Time", hdr_model:"Model", hdr_note:"Note",
    sess_placeholder:"Unnamed", sess_activate:"Activate", sess_switch:"Switch", sess_close:"Close",
    sess_save:"Save", sess_cancel:"Cancel", sess_delete:"Delete",
    empty_history:"No history", err_history:"Failed to load history",
    default_dir:"(default directory)", today_prefix:"Today",
    not_connected:"Not connected", connected:"Connected", connected_resume:"Connected (resumed)",
    session_ended:"Session ended", token_invalid:"Invalid token", disconnected:"Disconnected",
    reconnecting:"Reconnecting…", spawn_error:"Spawn error", update_failed:"Update failed",
    confirm_delete:"Delete this session?", confirm_cancel:"Cancel", confirm_ok:"Delete",
    confirm_close_tab:"Close this session?", confirm_close_tab_ok:"Close",
    rename_title:"Rename Session", rename_save:"Save", rename_cancel:"Cancel",
    default_model:"Claude (local login)", builtin_tag:"Built-in", model_del:"Delete",
    cloud_title:"Cloud", cloud_unbound:"Not connected", cloud_bound:"Connected",
    cloud_base_url:"Cloud server", cloud_connect:"Connect", cloud_logout:"Disconnect",
    cloud_enter_code:"Confirm this code in your browser:", cloud_open_browser:"Open authorization page",
    cloud_waiting:"Waiting for confirmation…", cloud_cancel:"Cancel",
    cloud_connected_ok:"Connected to cloud", cloud_err:"Cloud error",
    cloud_save_title:"Save to cloud", cloud_saving:"Saving to cloud…", cloud_saved:"Saved to cloud (v{v})",
    cloud_save_err:"Save failed", cloud_not_connected:"Connect cloud in Config first",
    sel_toggle:"Select", sel_cancel:"Cancel", sel_all:"Select all", sel_none:"Deselect all",
    sel_count:"{n} selected", sel_apply_model:"Apply",
    sel_confirm_delete:"Delete {n} selected sessions?", sel_confirm_activate:"Open {n} sessions?",
    sel_done:"Done: {ok} succeeded, {fail} failed",
    menu_lang:"Language", sw_sessions:"Sessions", sw_new:"New", sw_hist:"From history",
    sw_open:"Open", sw_back:"‹ Back", sw_resume:"Resume from history",
    term_empty_hint:"No open session. Tap ⊞ to start or resume one.", no_active_session:"No active session",
  },
  zh: {
    gate_sub:"请输入服务端访问令牌", gate_placeholder:"访问令牌",
    gate_remember:"记住令牌", gate_enter:"进入",
    gate_err_invalid:"令牌错误，请重试",
    gate_err_expired:"已保存令牌已失效，请重新输入", gate_err_load:"加载失败",
    sec_new_session:"新建会话", sec_history:"历史记录",
    btn_start:"开始", btn_config:"配置", btn_logout:"退出登录",
    logout_confirm:"退出登录并清除本浏览器已保存的访问令牌?",
    etm_title:"外网访问",
    etm_warn:"任何持分享链接的人都能访问你本机的终端。请私下分享;关闭即断开公网入口。",
    etm_off:"未开启", etm_connecting:"连接中…", etm_online:"已上线", etm_error:"出错",
    etm_enable:"开启外网访问", etm_disable:"关闭外网访问",
    etm_hint:"打开网址后，在登录页输入下方的访问密钥即可。",
    etm_url_pc:"电脑端地址", etm_url_mobile:"手机端地址（/m）", etm_token:"访问密钥",
    etm_copy:"复制", etm_copied:"已复制", etm_copy_all:"一键复制全部（网址 + 密钥）",
    etm_copied_all:"已复制全部", etm_refresh:"↻",
    etm_qr_pc:"扫码打开（电脑端）", etm_qr_mobile:"扫码打开（手机端）",
    etm_qr_token:"扫码获取密钥", etm_saved:"已保存", etm_close:"关闭",
    tab_home:"主页", tab_config:"配置", tab_ext:"外网",
    cfg_frp_title:"外网访问（frp 服务器）", cfg_frp_save:"保存服务器设置",
    cfg_frp_saved:"服务器设置已保存",
    cfg_token_reset:"重置并踢出全部",
    cfg_token_reset_confirm:"重置访问密钥并断开所有已登录客户端?他们需用新密钥重新登录。",
    cfg_token_resetting:"重置中…", cfg_token_reset_done:"密钥已重置 — 踢出 {n} 个连接",
    cfg_title:"配置", cfg_dirs_label:"project_dirs（一行一个）",
    cfg_models_label:"模型列表", cfg_add_model:"+ 添加模型",
    cfg_import_model:"↑ 导入", cfg_export_model:"↓ 导出", cfg_import_err:"导入失败",
    cfg_import_all:"↑ 导入全部", cfg_export_all:"↓ 导出全部", cfg_import_all_err:"导入失败",
    cfg_import_done:"已导入 — 请检查后保存",
    cfg_pick_title_export:"选择要导出的配置项", cfg_pick_title_import:"选择要导入的配置项",
    cfg_pick_all:"全选", cfg_pick_ok:"确定", cfg_pick_cancel:"取消",
    cfg_save:"保存", cfg_apply:"应用生效",
    cfg_loading:"加载中…", cfg_saving:"保存中…", cfg_saved:"已保存", cfg_save_err:"保存失败",
    cfg_applying:"应用中…", cfg_applied:"已应用生效", cfg_apply_err:"应用失败",
    cfg_load_err:"加载配置失败",
    hdr_time:"时间", hdr_model:"模型", hdr_note:"备注",
    sess_placeholder:"未命名", sess_activate:"激活", sess_switch:"切换", sess_close:"断开",
    sess_save:"保存", sess_cancel:"取消", sess_delete:"删除",
    empty_history:"暂无历史会话", err_history:"历史加载失败",
    default_dir:"（默认目录）", today_prefix:"今天",
    not_connected:"未连接", connected:"已连接", connected_resume:"已连接（恢复会话）",
    session_ended:"会话已结束", token_invalid:"令牌无效", disconnected:"已断开",
    reconnecting:"重连中…", spawn_error:"启动失败", update_failed:"更新失败",
    confirm_delete:"确定要删除此会话吗？", confirm_cancel:"取消", confirm_ok:"删除",
    confirm_close_tab:"关闭此会话？", confirm_close_tab_ok:"关闭",
    rename_title:"重命名会话", rename_save:"保存", rename_cancel:"取消",
    default_model:"官方 Claude（本机登录）", builtin_tag:"内置", model_del:"删除",
    cloud_title:"云端", cloud_unbound:"未连接", cloud_bound:"已连接",
    cloud_base_url:"云端服务器", cloud_connect:"连接云端", cloud_logout:"解绑",
    cloud_enter_code:"请在浏览器确认此验证码：", cloud_open_browser:"打开授权页面",
    cloud_waiting:"等待确认中…", cloud_cancel:"取消",
    cloud_connected_ok:"已连接云端", cloud_err:"云端错误",
    cloud_save_title:"保存到云端", cloud_saving:"正在保存到云端…", cloud_saved:"已保存到云端（v{v}）",
    cloud_save_err:"保存失败", cloud_not_connected:"请先在配置里连接云端",
    sel_toggle:"选择", sel_cancel:"取消", sel_all:"全选", sel_none:"取消全选",
    sel_count:"已选 {n} 项", sel_apply_model:"应用",
    sel_confirm_delete:"删除选中的 {n} 个会话？", sel_confirm_activate:"打开选中的 {n} 个会话？",
    sel_done:"完成：成功 {ok}，失败 {fail}",
    menu_lang:"语言", sw_sessions:"会话", sw_new:"新建", sw_hist:"历史新建",
    sw_open:"已打开", sw_back:"‹ 返回", sw_resume:"从历史恢复",
    term_empty_hint:"还没有打开的会话。点 ⊞ 新建或从历史恢复。", no_active_session:"无活动会话",
  },
};

let _lang = localStorage.getItem("agent_lang") || "en";
function t(key) { return (TRANSLATIONS[_lang] || TRANSLATIONS.en)[key] || key; }

function setLang(lang) {
  _lang = lang;
  localStorage.setItem("agent_lang", lang);
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll(".lb[data-lang]").forEach((b) => b.classList.toggle("active", b.dataset.lang === _lang));
  if (!$("app").classList.contains("hidden")) {
    if (_view === "home") { if (_lastOpts) populate(_lastOpts); renderHistory(); }
    else if (_view === "config") { renderModels(_lastCfgModels); }
    updateCtx();
  }
}

// ---------- token + fetch wrapper (Bearer header; never in URL) ----------
let token = "";
if (new URLSearchParams(location.search).has("token")) history.replaceState(null, "", location.pathname);
let _lastOpts = null, _lastCfgModels = [], _extraModels = [];
function _allModels() { return [{ id: "", name: t("default_model") }, ..._extraModels]; }
function tokenQs() { return ""; }

const _origFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : (input && input.url) || "";
  if (token && url.startsWith("/api")) {
    init = { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` } };
  }
  return _origFetch(input, init);
};

// ---------- Options / gate ----------
async function fetchOptions() {
  const r = await fetch(`/api/project-dirs`);
  if (r.status === 401) throw new Error(t("gate_err_invalid"));
  if (!r.ok) throw new Error(t("gate_err_load"));
  const dirs = await r.json();
  const models = await fetch(`/api/models`).then((r) => r.json());
  return { dirs, models };
}

function populate({ dirs, models }) {
  _lastOpts = { dirs, models };
  _extraModels = models || [];
  if ($("model")) {
    $("model").innerHTML = _allModels().map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("");
    $("cwd").innerHTML = (dirs || []).map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join("");
  }
  if ($("batch-model")) {
    $("batch-model").innerHTML = _allModels().map((m) =>
      `<option value="${esc(m.id)}" data-name="${esc(m.name)}">${esc(m.name)}</option>`).join("");
  }
}

async function enter(tok) {
  const prev = token;
  token = tok;
  let opts;
  try { opts = await fetchOptions(); }
  catch (e) { token = prev; throw e; }
  populate(opts);
  $("gate").classList.add("hidden");
  $("app").classList.remove("hidden");
  showView("home");
  await renderHistory();
  await _restoreSessions();
}

$("enter").onclick = () => {
  $("gate-err").textContent = "";
  const tok = $("token-input").value.trim();
  enter(tok).then(() => {
    if ($("remember-token").checked) localStorage.setItem("agent_token", tok);
    else localStorage.removeItem("agent_token");
  }).catch((e) => { $("gate-err").textContent = e.message; });
};
$("token-input").addEventListener("keydown", (e) => { if (e.key === "Enter") $("enter").click(); });

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

// ---------- View routing ----------
let _view = "home";
function showView(v) {
  _view = v;
  if (_selectMode && v !== "home") setSelectMode(false);
  document.querySelectorAll(".view").forEach((el) => el.classList.remove("on"));
  $("v-" + (v === "config" ? "cfg" : v)).classList.add("on");
  closeMenu(); closeSwitcher();
  if (v === "term") { const s = getActive(); if (s) requestAnimationFrame(() => { s.fitAddon.fit(); s.terminal.focus(); }); }
  if (v === "config") showConfig().catch((e) => cfgStatus(e.message, "#e57373"));
  if (v === "ext") { $("etm-err").textContent = ""; _etmStatus().then((s) => { if (s && s.state === "connecting") _etmStartPoll(); }).catch((e) => { $("etm-err").textContent = e.message; }); }
  updateCtx();
}

function updateCtx() {
  const nameEl = $("ctx-name"), subEl = $("ctx-sub");
  if (_view === "term") {
    const s = getActive();
    nameEl.textContent = s ? s.label : t("no_active_session");
    subEl.textContent = s ? t(s.statusKey) : "";
    subEl.style.color = s ? (s.statusColor || "var(--t3)") : "var(--t3)";
  } else {
    nameEl.textContent = { home: t("tab_home"), config: t("cfg_title"), ext: t("etm_title") }[_view] || "";
    subEl.textContent = ""; subEl.style.color = "var(--t3)";
  }
}

// ---------- Multi-session model ----------
const _MAX_RECONNECT = 8, _HEARTBEAT_MS = 5000;
let _sessions = [], _activeId = null, _counter = 0, _ctrlArmed = false;

function getActive() { return _sessions.find((s) => s.id === _activeId) || null; }
function tabLabelFromTag(tag, fallback) {
  const s = (tag || "").replace(/\s+/g, " ").trim();
  if (!s) return fallback;
  return s.length > 24 ? s.slice(0, 24) + "…" : s;
}

function createSession() {
  const id = ++_counter;
  const panel = document.createElement("div");
  panel.className = "term-panel";
  panel.dataset.id = String(id);
  $("term-stack").appendChild(panel);

  const terminal = new Terminal({
    fontSize: 13, fontFamily: "Consolas, 'Courier New', monospace",
    cursorBlink: true, theme: { background: "#1e1e1e" },
  });
  const fitAddon = new FitAddon.FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(panel);

  const sess = {
    id, label: `Session ${id}`, panel, terminal, fitAddon,
    ws: null, sid: null, model_id: "", connectOpts: null,
    intentionalClose: false, reconnectTimer: null, reconnectCount: 0,
    statusKey: "not_connected", statusColor: "", heartbeat: null,
  };

  terminal.onData((d) => {
    if (_ctrlArmed && d.length === 1) {
      sendTo(sess, { type: "input", data: String.fromCharCode(d.toUpperCase().charCodeAt(0) & 0x1f) });
      setCtrl(false);
      return;
    }
    sendTo(sess, { type: "input", data: d });
  });

  _sessions.push(sess);
  applyKbMode(sess);
  return sess;
}

// ---------- Soft-keyboard gating ----------
// Default: keyboard suppressed. xterm's helper textarea gets inputmode=none so
// focusing it (which happens on activate / shortcut keys) never raises the soft
// keyboard. The ⌨ key flips it to text + focuses to bring the keyboard up.
let _kbAllowed = false;
function helperTextarea(sess) { return sess.panel.querySelector(".xterm-helper-textarea"); }
function applyKbMode(sess) {
  const ta = helperTextarea(sess);
  if (ta) ta.inputMode = _kbAllowed ? "text" : "none";
}
function setKbAllowed(v) {
  _kbAllowed = v;
  const b = $("key-kb"); if (b) b.classList.toggle("armed", v);
  _sessions.forEach(applyKbMode);
  const s = getActive(); if (!s) return;
  if (v) s.terminal.focus();                          // raise the keyboard
  else { const ta = helperTextarea(s); if (ta) ta.blur(); }  // dismiss it
}

function sendTo(sess, obj) {
  if (sess.ws && sess.ws.readyState === WebSocket.OPEN) sess.ws.send(JSON.stringify(obj));
}

function setSessStatus(sess, key, color) {
  sess.statusKey = key; sess.statusColor = color || "";
  if (sess.id === _activeId && _view === "term") updateCtx();
}

function activateSession(id) {
  const prev = getActive();
  if (prev && prev.id !== id) prev.panel.classList.remove("on");
  _activeId = id;
  const s = getActive();
  $("term-empty").classList.toggle("hidden", !!s);
  if (s) { s.panel.classList.add("on"); }
  showView("term");
  if (s) requestAnimationFrame(() => { s.fitAddon.fit(); s.terminal.focus(); });
  _saveSessions();
}

function scheduleReconnect(sess) {
  if (sess.reconnectCount >= _MAX_RECONNECT) { setSessStatus(sess, "disconnected", "#e57373"); return; }
  sess.reconnectCount++;
  const delay = Math.min(1000 * Math.pow(2, sess.reconnectCount - 1), 30000);
  setSessStatus(sess, "reconnecting", "#ff9800");
  sess.reconnectTimer = setTimeout(() => {
    if (!_sessions.includes(sess)) { sess.reconnectCount = 0; return; }
    connectSession(sess, { ...sess.connectOpts, resume: sess.sid || sess.connectOpts?.resume });
  }, delay);
}

function connectSession(sess, opts) {
  clearTimeout(sess.reconnectTimer);
  clearInterval(sess.heartbeat);
  sess.intentionalClose = false;
  sess.connectOpts = opts;
  sess.model_id = opts.model_id || "";
  sess.terminal.clear();
  if (sess.panel.classList.contains("on")) sess.fitAddon.fit();

  const proto = location.protocol === "https:" ? "wss" : "ws";
  const wsUrl = `${proto}://${location.host}/ws/term`;
  sess.ws = token ? new WebSocket(wsUrl, ["bearer", token]) : new WebSocket(wsUrl);
  sess.ws.binaryType = "arraybuffer";

  sess.ws.onopen = () => {
    sess.reconnectCount = 0;
    setSessStatus(sess, opts.resume ? "connected_resume" : "connected", "#4caf50");
    if (sess.panel.classList.contains("on")) sess.fitAddon.fit();
    sendTo(sess, { type: "spawn", resume: opts.resume, model_id: opts.model_id, cwd: opts.cwd,
      cols: sess.terminal.cols, rows: sess.terminal.rows });
    sess.heartbeat = setInterval(() => sendTo(sess, { type: "ping" }), _HEARTBEAT_MS);
  };
  sess.ws.onmessage = (ev) => {
    if (typeof ev.data === "string") {
      const msg = JSON.parse(ev.data);
      if (msg.type === "spawned") { sess.sid = msg.sid; _saveSessions(); }
      else if (msg.type === "spawn_error") sess.terminal.write(`\r\n[${t("spawn_error")}] ${msg.error}\r\n`);
      else if (msg.type === "closed") setSessStatus(sess, "session_ended", "#e57373");
      return;
    }
    sess.terminal.write(new Uint8Array(ev.data));
  };
  sess.ws.onclose = (ev) => {
    clearInterval(sess.heartbeat);
    if (ev.code === 4003) { setSessStatus(sess, "token_invalid", "#e57373"); return; }
    if (sess.intentionalClose) { setSessStatus(sess, "disconnected", "#e57373"); return; }
    scheduleReconnect(sess);
  };
}

// Start a brand-new or resumed session and bring it to the foreground.
function startSession(opts) {
  const sess = createSession();
  if (opts.label) sess.label = tabLabelFromTag(opts.label, sess.label);
  if (opts.resume) sess.sid = opts.resume;
  activateSession(sess.id);
  connectSession(sess, opts);
  updateBadge();
  _saveSessions();
  return sess;
}

function closeSession(id) {
  const idx = _sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  const sess = _sessions[idx];
  sess.intentionalClose = true;
  clearTimeout(sess.reconnectTimer);
  clearInterval(sess.heartbeat);
  if (sess.ws) { try { sess.ws.close(); } catch (_) {} }
  sess.terminal.dispose();
  sess.panel.remove();
  _sessions.splice(idx, 1);
  if (_activeId === id) {
    const next = _sessions[Math.min(idx, _sessions.length - 1)];
    if (next) { _activeId = next.id; next.panel.classList.add("on"); $("term-empty").classList.add("hidden"); updateCtx(); }
    else { _activeId = null; $("term-empty").classList.remove("hidden"); if (_view === "term") showView("home"); }
  }
  updateBadge();
  _saveSessions();
}

function updateBadge() {
  const n = _sessions.length;
  const b = $("tab-badge");
  b.textContent = String(n);
  b.classList.toggle("hidden", n === 0);
}

// ---------- Session persistence ----------
const _SESS_KEY = "agent_m_sessions";
let _restoring = false;
function _saveSessions() {
  if (_restoring) return;
  const sessions = _sessions.filter((s) => s.sid).map((s) => ({
    sid: s.sid, label: s.label, model_id: s.model_id || s.connectOpts?.model_id || "",
    cwd: s.connectOpts?.cwd || "",
  }));
  try { localStorage.setItem(_SESS_KEY, JSON.stringify({ sessions, activeSid: getActive()?.sid || null })); } catch (_) {}
}
async function _restoreSessions() {
  let raw = null;
  try { raw = localStorage.getItem(_SESS_KEY); } catch (_) {}
  if (!raw) return;
  localStorage.removeItem(_SESS_KEY);
  let saved; try { saved = JSON.parse(raw); } catch (_) { return; }
  if (!saved || !Array.isArray(saved.sessions) || !saved.sessions.length) return;
  let serverSessions = [];
  try { serverSessions = (await fetch(`/api/sessions`).then((r) => r.json())).flatMap((g) => g.sessions); }
  catch (_) { return; }
  const serverMap = new Map(serverSessions.map((s) => [s.sid, s]));
  let restoreActive = null;
  _restoring = true;
  try {
    for (const sv of saved.sessions) {
      if (!serverMap.has(sv.sid)) continue;
      const sess = createSession();
      sess.label = tabLabelFromTag(sv.label, sess.label);
      sess.sid = sv.sid;
      connectSession(sess, { resume: sv.sid, cwd: sv.cwd || undefined, model_id: sv.model_id || undefined });
      if (sv.sid === saved.activeSid) restoreActive = sess.id;
    }
  } finally { _restoring = false; }
  updateBadge();
  _saveSessions();
  // restore quietly in the background; keep the user on Home
  if (restoreActive) { _activeId = restoreActive; const s = getActive(); if (s) { s.panel.classList.add("on"); $("term-empty").classList.add("hidden"); } }
  if (_view === "home") renderHistory();   // reflect restored sessions' "Switch" badges
}

// ---------- Home: New Session ----------
$("start").onclick = () => startSession({ model_id: $("model").value || undefined, cwd: $("cwd").value || undefined });

// ---------- Home: History (grouped + select/batch + inline edit) ----------
let _selectMode = false, _selectedSids = new Set(), _sessionBySid = new Map(), _collapsed = new Set();

async function patchSession(sid, body) {
  const r = await fetch(`/api/sessions/${encodeURIComponent(sid)}${tokenQs()}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(t("update_failed"));
}

function fmtWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const now = new Date(), hm = d.toTimeString().slice(0, 5);
  if (d.toDateString() === now.toDateString()) return `${t("today_prefix")} ${hm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}

function openSidSet() { return new Set(_sessions.map((s) => s.sid).filter(Boolean)); }

async function renderHistory() {
  const box = $("history");
  let groups = [];
  try { groups = await fetch(`/api/sessions${tokenQs()}`).then((r) => r.json()); }
  catch (e) { box.innerHTML = `<div class="empty">${t("err_history")}</div>`; _sessionBySid.clear(); _selectedSids.clear(); updateBatchBar(); return; }
  if (!groups.length) { box.innerHTML = `<div class="empty">${t("empty_history")}</div>`; _sessionBySid.clear(); _selectedSids.clear(); updateBatchBar(); return; }

  _sessionBySid.clear();
  const openSids = openSidSet();
  box.innerHTML = groups.map((g) => {
    const cards = g.sessions.map((s) => {
      _sessionBySid.set(s.sid, s);
      const tag = s.tag || "", modelId = s.model_id || "";
      const isOpen = openSids.has(s.sid);
      const stCls = isOpen ? "open" : (s.status === "active" ? "active" : "closed");
      const modelOpts = _allModels().map((m) =>
        `<option value="${esc(m.id)}"${m.id === modelId ? " selected" : ""}>${esc(m.name)}</option>`).join("");
      return `<div class="hsess${_selectedSids.has(s.sid) ? " sel" : ""}" data-sid="${esc(s.sid)}">
        <div class="r1">
          <input type="checkbox" class="chk" data-sid="${esc(s.sid)}"${_selectedSids.has(s.sid) ? " checked" : ""} />
          <span class="dot ${stCls}"></span>
          <span class="nm">${esc(tag || t("sess_placeholder"))}</span>
          <span class="when">${esc(fmtWhen(s.last_active_at))}</span>
          <button class="act${isOpen ? " open" : ""}" data-act="${esc(s.sid)}" data-cwd="${esc(s.cwd)}"
            data-model="${esc(modelId)}" data-orig-model="${esc(modelId)}" data-status="${esc(s.status)}"
            data-tag="${esc(tag)}">${isOpen ? t("sess_switch") : t("sess_activate")}</button>
        </div>
        <div class="r2">
          <select class="msel" data-sid="${esc(s.sid)}">${modelOpts}</select>
          <textarea class="note" rows="1" placeholder="${t("sess_placeholder")}"
            data-sid="${esc(s.sid)}" data-orig="${esc(tag)}">${esc(tag)}</textarea>
        </div>
      </div>`;
    }).join("");
    const label = g.cwd || t("default_dir");
    const col = _collapsed.has(label);
    return `<div class="grp">
      <div class="grp-head" data-grp="${esc(label)}">
        <span class="caret">${col ? "▸" : "▾"}</span>
        <span class="path">${esc(label)}</span><span class="count">${g.sessions.length}</span>
      </div>
      <div class="grp-body${col ? " collapsed" : ""}">${cards}</div>
    </div>`;
  }).join("");

  for (const sid of [..._selectedSids]) if (!_sessionBySid.has(sid)) _selectedSids.delete(sid);

  box.querySelectorAll(".grp-head").forEach((h) => {
    h.onclick = () => {
      const label = h.dataset.grp, body = h.nextElementSibling;
      const collapsed = body.classList.toggle("collapsed");
      if (collapsed) _collapsed.add(label); else _collapsed.delete(label);
      h.querySelector(".caret").textContent = collapsed ? "▸" : "▾";
    };
  });

  box.querySelectorAll(".chk").forEach((cb) => {
    cb.onchange = () => {
      if (cb.checked) _selectedSids.add(cb.dataset.sid); else _selectedSids.delete(cb.dataset.sid);
      cb.closest(".hsess").classList.toggle("sel", cb.checked);
      updateBatchBar();
    };
  });

  box.querySelectorAll("button.act").forEach((b) => {
    b.onclick = async () => {
      const sid = b.dataset.act;
      const existing = _sessions.find((s) => s.sid === sid);
      if (existing) { activateSession(existing.id); return; }   // already open → switch
      const modelChanged = b.dataset.model !== b.dataset.origModel;
      if (b.dataset.status === "active" && modelChanged) {
        await fetch(`/api/sessions/${encodeURIComponent(sid)}/close${tokenQs()}`, { method: "POST" }).catch(() => {});
      }
      startSession({ resume: sid, cwd: b.dataset.cwd || undefined, model_id: b.dataset.model || undefined, label: b.dataset.tag || undefined });
    };
  });

  box.querySelectorAll(".msel").forEach((sel) => {
    sel.dataset.prev = String(sel.selectedIndex);
    sel.addEventListener("change", async () => {
      try {
        await patchSession(sel.dataset.sid, { model_id: sel.value, model_name: sel.options[sel.selectedIndex].text });
        sel.dataset.prev = String(sel.selectedIndex);
        const act = sel.closest(".hsess").querySelector("button.act");
        if (act) act.dataset.model = sel.value;
      } catch (_) { sel.selectedIndex = parseInt(sel.dataset.prev) || 0; }
    });
  });

  box.querySelectorAll(".note").forEach((inp) => {
    const grow = () => { inp.style.height = "auto"; inp.style.height = inp.scrollHeight + "px"; };
    grow();
    inp.addEventListener("input", grow);
    const save = async () => {
      const v = inp.value.trim();
      try { await patchSession(inp.dataset.sid, { tag: v }); inp.dataset.orig = v;
        const nm = inp.closest(".hsess").querySelector(".nm"); if (nm) nm.textContent = v || t("sess_placeholder");
      } catch (_) { inp.value = inp.dataset.orig; }
      grow(); inp.blur();
    };
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); }
      if (e.key === "Escape") { e.preventDefault(); inp.value = inp.dataset.orig; grow(); inp.blur(); }
    });
    inp.addEventListener("blur", () => { if (inp.value.trim() !== inp.dataset.orig) save(); });
  });

  updateBatchBar();
}

// ---------- Batch / select mode ----------
function setSelectMode(on) {
  _selectMode = on;
  if (!on) _selectedSids.clear();
  $("sel-toggle").classList.toggle("on", on);
  $("sel-toggle").textContent = on ? t("sel_cancel") : t("sel_toggle");
  $("history").classList.toggle("select", on);
  $("batch-bar").classList.toggle("hidden", !on);
  $("history").querySelectorAll(".chk").forEach((cb) => { cb.checked = _selectedSids.has(cb.dataset.sid); });
  updateBatchBar();
}
$("sel-toggle").onclick = () => setSelectMode(!_selectMode);
$("batch-cancel").onclick = () => setSelectMode(false);

function updateBatchBar() {
  const n = _selectedSids.size, total = _sessionBySid.size;
  $("batch-count").textContent = t("sel_count").replace("{n}", String(n));
  $("batch-select-all").textContent = (n > 0 && n === total) ? t("sel_none") : t("sel_all");
  const anyActive = [..._selectedSids].some((sid) => _sessionBySid.get(sid)?.status === "active");
  $("batch-activate").disabled = n === 0;
  $("batch-cloud-save").disabled = n === 0;
  $("batch-model").disabled = n === 0;
  $("batch-apply-model").disabled = n === 0;
  $("batch-close").disabled = !anyActive;
  $("batch-delete").disabled = n === 0;
}
function setBatchBusy(b) {
  $("batch-bar").querySelectorAll("button,select").forEach((el) => { el.disabled = b; });
  if (!b) updateBatchBar();
}
$("batch-select-all").onclick = () => {
  if (_selectedSids.size > 0 && _selectedSids.size === _sessionBySid.size) _selectedSids.clear();
  else for (const sid of _sessionBySid.keys()) _selectedSids.add(sid);
  $("history").querySelectorAll(".chk").forEach((cb) => { cb.checked = _selectedSids.has(cb.dataset.sid); cb.closest(".hsess").classList.toggle("sel", cb.checked); });
  updateBatchBar();
};
$("batch-activate").onclick = async () => {
  const sids = [..._selectedSids]; if (!sids.length) return;
  if (sids.length > 5 && !(await showConfirm(t("sel_confirm_activate").replace("{n}", String(sids.length))))) return;
  for (const sid of sids) {
    const existing = _sessions.find((s) => s.sid === sid);
    if (existing) continue;
    const s = _sessionBySid.get(sid); if (!s) continue;
    startSession({ resume: sid, cwd: s.cwd || undefined, model_id: s.model_id || undefined, label: s.tag || undefined });
  }
  setSelectMode(false);
};
$("batch-cloud-save").onclick = async () => {
  const sids = [..._selectedSids]; if (!sids.length) return;
  setBatchBusy(true);
  let ok = 0, fail = 0, unbound = false;
  for (const sid of sids) {
    try {
      const r = await fetch(`/api/cloud/sync/${encodeURIComponent(sid)}${tokenQs()}`, { method: "POST" });
      if (r.status === 400) { unbound = true; break; }
      if (r.ok) ok++; else fail++;
    } catch (_) { fail++; }
  }
  setBatchBusy(false);
  $("batch-status").textContent = unbound ? t("cloud_not_connected")
    : t("sel_done").replace("{ok}", String(ok)).replace("{fail}", String(fail));
  setTimeout(() => { $("batch-status").textContent = ""; }, 4000);
};
$("batch-apply-model").onclick = async () => {
  const sids = [..._selectedSids]; if (!sids.length) return;
  const sel = $("batch-model"), modelId = sel.value, modelName = sel.options[sel.selectedIndex].dataset.name || "";
  setBatchBusy(true);
  let ok = 0, fail = 0;
  for (const sid of sids) { try { await patchSession(sid, { model_id: modelId, model_name: modelName }); ok++; } catch (_) { fail++; } }
  await renderHistory();
  $("batch-status").textContent = t("sel_done").replace("{ok}", String(ok)).replace("{fail}", String(fail));
  setTimeout(() => { $("batch-status").textContent = ""; }, 4000);
};
$("batch-close").onclick = async () => {
  const sids = [..._selectedSids].filter((sid) => _sessionBySid.get(sid)?.status === "active");
  if (!sids.length) return;
  setBatchBusy(true);
  for (const sid of sids) {
    const open = _sessions.find((s) => s.sid === sid);
    if (open) closeSession(open.id);
    await fetch(`/api/sessions/${encodeURIComponent(sid)}/close${tokenQs()}`, { method: "POST" }).catch(() => {});
  }
  await renderHistory();
};
$("batch-delete").onclick = async () => {
  const sids = [..._selectedSids]; if (!sids.length) return;
  if (!(await showConfirm(t("sel_confirm_delete").replace("{n}", String(sids.length))))) return;
  setBatchBusy(true);
  for (const sid of sids) {
    const open = _sessions.find((s) => s.sid === sid);
    if (open) closeSession(open.id);
    await fetch(`/api/sessions/${encodeURIComponent(sid)}${tokenQs()}`, { method: "DELETE" }).catch(() => {});
    _selectedSids.delete(sid);
  }
  await renderHistory();
};

// ---------- ☰ Menu ----------
function openMenu() { $("menu").classList.add("on"); $("scrim").classList.add("on"); }
function closeMenu() { $("menu").classList.remove("on"); $("scrim").classList.remove("on"); }
$("btn-menu").onclick = () => { if ($("menu").classList.contains("on")) closeMenu(); else { closeSwitcher(); openMenu(); } };
$("scrim").onclick = () => { closeMenu(); };
$("m-home").onclick = () => showView("home");
$("m-config").onclick = () => showView("config");
$("m-ext").onclick = () => showView("ext");
$("m-cloud-save").onclick = () => { closeMenu(); cloudSaveActive(); };
$("m-logout").onclick = async () => {
  closeMenu();
  if (!(await showConfirm(t("logout_confirm")))) return;
  localStorage.removeItem("agent_token");
  localStorage.removeItem(_SESS_KEY);
  token = "";
  location.reload();
};
document.querySelectorAll(".menu .lb[data-lang]").forEach((b) => b.onclick = () => setLang(b.dataset.lang));

// ---------- ⊞ Switcher ----------
function openSwitcher() { closeMenu(); renderGrid(); $("hsheet").classList.remove("on"); $("sw").classList.add("on"); }
function closeSwitcher() { $("sw").classList.remove("on"); $("hsheet").classList.remove("on"); }
$("btn-grid").onclick = () => { if ($("sw").classList.contains("on")) closeSwitcher(); else openSwitcher(); };
$("sw-close").onclick = () => closeSwitcher();

function sessionThumb(sess) {
  try {
    const buf = sess.terminal.buffer.active, out = [];
    const start = Math.max(0, buf.length - 12);
    for (let i = start; i < buf.length; i++) {
      const line = buf.getLine(i);
      if (line) out.push(line.translateToString(true).slice(0, 30));
    }
    const txt = out.join("\n").trim();
    return esc(txt || sess.label);
  } catch (_) { return esc(sess.label); }
}

function renderGrid() {
  const g = $("sw-grid");
  if (!_sessions.length) { g.innerHTML = `<div class="sw-empty">${t("term_empty_hint")}</div>`; return; }
  g.innerHTML = _sessions.map((s) => {
    const cwd = (s.connectOpts?.cwd || "").split(/[\\/]/).pop() || "";
    return `<div class="tcard${s.id === _activeId ? " cur" : ""}" data-id="${s.id}">
      <div class="thumb"><button class="x" data-close="${s.id}">×</button>${sessionThumb(s)}</div>
      <div class="foot"><div class="nm">${esc(s.label)}</div>
        <div class="mt"><span class="dot ${esc(s.statusKey === "connected" || s.statusKey === "connected_resume" ? "online" : s.statusKey)}"></span><span>${esc(cwd)}</span></div></div>
    </div>`;
  }).join("");
  g.querySelectorAll(".tcard").forEach((c) => {
    c.onclick = () => { closeSwitcher(); activateSession(parseInt(c.dataset.id)); };
  });
  g.querySelectorAll(".x").forEach((x) => {
    x.onclick = async (e) => {
      e.stopPropagation();
      const id = parseInt(x.dataset.close);
      if (await showConfirm(t("confirm_close_tab"), { okLabel: t("confirm_close_tab_ok") })) {
        closeSession(id);
        if (_sessions.length) renderGrid(); else closeSwitcher();
      }
    };
  });
}

$("sw-new").onclick = () => { closeSwitcher(); showView("home"); };
$("sw-hist").onclick = () => { renderHistSheet(); $("hsheet").classList.add("on"); };
$("hsheet-back").onclick = () => $("hsheet").classList.remove("on");

async function renderHistSheet() {
  const body = $("hist-body");
  body.innerHTML = `<div class="empty">${t("cfg_loading")}</div>`;
  let groups = [];
  try { groups = await fetch(`/api/sessions${tokenQs()}`).then((r) => r.json()); } catch (_) {}
  const sessions = groups.flatMap((g) => g.sessions.map((s) => ({ ...s, cwd: s.cwd || g.cwd })));
  if (!sessions.length) { body.innerHTML = `<div class="empty">${t("empty_history")}</div>`; return; }
  body.innerHTML = sessions.map((s) => `
    <div class="hsess"><div class="r1">
      <span class="dot ${s.status === "active" ? "active" : "closed"}"></span>
      <span class="nm">${esc(s.tag || t("sess_placeholder"))}</span>
      <span class="when">${esc(fmtWhen(s.last_active_at))}</span>
      <button class="act" data-sid="${esc(s.sid)}" data-cwd="${esc(s.cwd || "")}"
        data-model="${esc(s.model_id || "")}" data-tag="${esc(s.tag || "")}">${t("sess_activate")}</button>
    </div>
    <div class="r2"><span class="path" style="font-size:11px;color:var(--t3);font-family:Consolas,monospace">${esc(s.cwd || "")}</span></div></div>`).join("");
  body.querySelectorAll("button.act").forEach((b) => {
    b.onclick = () => {
      closeSwitcher();
      const existing = _sessions.find((s) => s.sid === b.dataset.sid);
      if (existing) { activateSession(existing.id); return; }
      startSession({ resume: b.dataset.sid, cwd: b.dataset.cwd || undefined, model_id: b.dataset.model || undefined, label: b.dataset.tag || undefined });
    };
  });
}

// ---------- Keys toolbar ----------
const KEY_SEQ = { esc:"\x1b", tab:"\t", enter:"\r", slash:"/", comma:",", space:" ",
  up:"\x1b[A", down:"\x1b[B", right:"\x1b[C", left:"\x1b[D" };
function setCtrl(v) { _ctrlArmed = v; const b = $("key-ctrl"); if (b) b.classList.toggle("armed", v); }
function initKeys() {
  // preventDefault on touchstart keeps the xterm textarea focused, but it also
  // suppresses the synthetic click — so fire the action in touchstart for touch,
  // and keep click only for desktop mouse (mousedown preventDefault preserves focus).
  // data-seq → control sequence (KEY_SEQ); data-txt → literal text (e.g. slash commands,
  // typed without Enter so the user can review/edit before sending)
  const fireSeq = (btn) => {
    const s = getActive(); if (!s) return;
    const data = btn.dataset.seq ? KEY_SEQ[btn.dataset.seq] : btn.dataset.txt;
    if (data == null) return;
    sendTo(s, { type: "input", data });
    if (_ctrlArmed) setCtrl(false);
    s.terminal.focus();
  };
  document.querySelectorAll("#keys .key[data-seq], #keys .key[data-txt]").forEach((btn) => {
    btn.addEventListener("touchstart", (e) => { e.preventDefault(); fireSeq(btn); }, { passive: false });
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => fireSeq(btn));
  });
  const ctrl = $("key-ctrl");
  const fireCtrl = () => { setCtrl(!_ctrlArmed); const s = getActive(); if (s) s.terminal.focus(); };
  ctrl.addEventListener("touchstart", (e) => { e.preventDefault(); fireCtrl(); }, { passive: false });
  ctrl.addEventListener("mousedown", (e) => e.preventDefault());
  ctrl.addEventListener("click", () => fireCtrl());
  // expand toggle: collapsed shows one row, expanded wraps the rest into more rows
  const exp = $("key-expand");
  const fireExp = () => {
    const open = $("keys").classList.toggle("expanded");
    exp.textContent = open ? "⌃" : "⌄";
    const s = getActive(); if (s) requestAnimationFrame(() => { s.fitAddon.fit(); s.terminal.focus(); });
  };
  exp.addEventListener("touchstart", (e) => { e.preventDefault(); fireExp(); }, { passive: false });
  exp.addEventListener("mousedown", (e) => e.preventDefault());
  exp.addEventListener("click", () => fireExp());
  // keyboard toggle: plain click only — preventDefault on touchstart would stop
  // focus() from raising the soft keyboard on iOS, so we must let the gesture through.
  const kb = $("key-kb");
  if (kb) kb.addEventListener("click", () => setKbAllowed(!_kbAllowed));
}
initKeys();

// ---------- Confirm dialog ----------
function showConfirm(msg, { okLabel, cancelLabel } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `<div class="confirm-card"><div class="confirm-msg">${esc(msg)}</div>
      <div class="confirm-actions">
        <button class="confirm-cancel">${esc(cancelLabel || t("confirm_cancel"))}</button>
        <button class="confirm-ok">${esc(okLabel || t("confirm_ok"))}</button></div></div>`;
    document.body.appendChild(overlay);
    const done = (v) => { overlay.remove(); resolve(v); };
    overlay.querySelector(".confirm-cancel").onclick = () => done(false);
    overlay.querySelector(".confirm-ok").onclick = () => done(true);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) done(false); });
  });
}

// ---------- Config ----------
function cfgStatus(text, color) { $("cfg-status").textContent = text || ""; $("cfg-status").style.color = color || "#888"; }

function builtinModelCard() {
  return `<div class="mcard builtin" data-builtin="1" data-id="1">
    <div class="mcard-h"><span class="midx">#1</span><span class="cfg-builtin-tag">${t("builtin_tag")}</span></div>
    <label>name<input class="m-name" value="${esc(t("default_model"))}" disabled /></label></div>`;
}
function nextModelId() {
  const cards = [...$("cfg-models").querySelectorAll(".mcard:not([data-builtin])")];
  return String(cards.reduce((m, c) => Math.max(m, parseInt(c.dataset.id) || 1), 1) + 1);
}
function modelCardHtml(m) {
  m = m || {}; const id = m.id || "";
  return `<div class="mcard" data-id="${esc(id)}">
    <div class="mcard-h"><span class="midx">#${esc(id)}</span><button class="m-del">${t("model_del")}</button></div>
    <label>name<input class="m-name" placeholder="name" value="${esc(m.name)}" /></label>
    <label>api_model<input class="m-model" placeholder="api_model" value="${esc(m.model)}" /></label>
    <label>base_url<input class="m-base" placeholder="base_url" value="${esc(m.base_url)}" /></label>
    <label>auth_token<input class="m-auth" placeholder="auth_token" value="${esc(m.auth_token)}" /></label></div>`;
}
function bindModelDel() { $("cfg-models").querySelectorAll(".m-del").forEach((b) => b.onclick = () => b.closest(".mcard").remove()); }
function renderModels(models) {
  _lastCfgModels = models || [];
  const numbered = (models || []).map((m, i) => ({ ...m, id: String(i + 2) }));
  $("cfg-models").innerHTML = builtinModelCard() + numbered.map(modelCardHtml).join("");
  bindModelDel();
}

async function showConfig() {
  cfgStatus(t("cfg_loading"));
  const cfg = await fetch(`/api/config${tokenQs()}`).then((r) => { if (!r.ok) throw new Error(t("cfg_load_err")); return r.json(); });
  $("cfg-claude-bin").value = cfg.claude_bin || "";
  $("cfg-token").value = cfg.access_token || "";
  $("cfg-dirs").value = (cfg.project_dirs || []).join("\n");
  renderModels(cfg.models);
  await loadCloudStatus();
  await loadFrpSettings();
  cfgStatus("");
}
function collectConfig() {
  const dirs = $("cfg-dirs").value.split(/[\n;,]/).map((s) => s.trim()).filter(Boolean);
  const models = [...$("cfg-models").querySelectorAll(".mcard:not([data-builtin])")].map((card) => ({
    id: card.dataset.id,
    name: card.querySelector(".m-name").value.trim(),
    model: card.querySelector(".m-model").value.trim(),
    base_url: card.querySelector(".m-base").value.trim(),
    auth_token: card.querySelector(".m-auth").value.trim(),
  })).filter((m) => m.id);
  return { claude_bin: $("cfg-claude-bin").value.trim() || "claude", access_token: $("cfg-token").value.trim(), project_dirs: dirs, models };
}

$("cfg-add-model").onclick = () => { $("cfg-models").insertAdjacentHTML("beforeend", modelCardHtml({ id: nextModelId() })); bindModelDel(); };
$("cfg-export-model").onclick = () => {
  const blob = new Blob([JSON.stringify(collectConfig().models, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "models.json"; a.click(); URL.revokeObjectURL(a.href);
};
$("cfg-import-model").onclick = () => $("cfg-import-file").click();
$("cfg-import-file").onchange = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      let data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) data = data.models || [];
      data.forEach((m) => $("cfg-models").insertAdjacentHTML("beforeend", modelCardHtml({ ...m, id: nextModelId() })));
      bindModelDel();
    } catch (err) { cfgStatus(t("cfg_import_err") + ": " + err.message, "#e57373"); }
  };
  reader.readAsText(file); e.target.value = "";
};

/* full config import/export with picker */
function showPicker(title, sections) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "picker-overlay";
    const items = sections.map((s) =>
      `<div class="picker-item"><input type="checkbox" id="_pk_${s.key}" data-key="${s.key}" ${s.checked ? "checked" : ""} />
        <label for="_pk_${s.key}">${esc(s.label)}</label></div>`).join("");
    overlay.innerHTML = `<div class="picker-card"><div class="picker-title">${esc(title)}</div>
      <div class="picker-list">
        <div class="picker-item"><input type="checkbox" id="_pk_all" checked /><label for="_pk_all"><b>${esc(t("cfg_pick_all"))}</b></label></div>
        <div class="picker-sep"></div>${items}</div>
      <div class="picker-actions"><button class="picker-cancel">${esc(t("cfg_pick_cancel"))}</button>
        <button class="picker-ok">${esc(t("cfg_pick_ok"))}</button></div></div>`;
    document.body.appendChild(overlay);
    const allCb = overlay.querySelector("#_pk_all"), cbs = [...overlay.querySelectorAll("[data-key]")];
    allCb.onchange = () => cbs.forEach((cb) => { cb.checked = allCb.checked; });
    cbs.forEach((cb) => { cb.onchange = () => { allCb.checked = cbs.every((c) => c.checked); }; });
    const done = (map) => { overlay.remove(); resolve(map); };
    overlay.querySelector(".picker-cancel").onclick = () => done(null);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) done(null); });
    overlay.querySelector(".picker-ok").onclick = () => { const map = {}; cbs.forEach((cb) => { map[cb.dataset.key] = cb.checked; }); done(map); };
  });
}
const CFG_SECTIONS = [
  { key:"claude_bin", label:"claude_bin" }, { key:"access_token", label:"access_token" },
  { key:"project_dirs", label:"project_dirs" }, { key:"models", label:"Models" },
  { key:"frp", label:"External Access (frp)" }, { key:"cloud", label:"Cloud base_url" },
];
$("cfg-export-all").onclick = async () => {
  const cfg = collectConfig();
  cfg.frp = { server_addr:$("cfg-frp-server-addr").value.trim(), server_port:$("cfg-frp-server-port").value.trim(),
    token:$("cfg-frp-token").value.trim(), subdomain_host:$("cfg-frp-subdomain-host").value.trim() };
  cfg.cloud_base_url = $("cloud-base-url").value.trim();
  const picked = await showPicker(t("cfg_pick_title_export"), CFG_SECTIONS.map((s) => ({ ...s, checked: true })));
  if (!picked) return;
  const out = {};
  Object.keys(picked).forEach((k) => { if (picked[k] && cfg[k] != null) out[k] = cfg[k]; });
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "claude-tape-config.json"; a.click(); URL.revokeObjectURL(a.href);
};
$("cfg-import-all").onclick = () => $("cfg-import-all-file").click();
$("cfg-import-all-file").onchange = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const cfg = JSON.parse(ev.target.result);
      const sections = CFG_SECTIONS.filter((s) => cfg[s.key] != null).map((s) => ({ ...s, checked: true }));
      if (!sections.length) { cfgStatus(t("cfg_import_all_err"), "#e57373"); return; }
      const picked = await showPicker(t("cfg_pick_title_import"), sections);
      if (!picked) return;
      if (picked.claude_bin && cfg.claude_bin != null) $("cfg-claude-bin").value = cfg.claude_bin;
      if (picked.access_token && cfg.access_token != null) $("cfg-token").value = cfg.access_token;
      if (picked.project_dirs && cfg.project_dirs != null) $("cfg-dirs").value = (Array.isArray(cfg.project_dirs) ? cfg.project_dirs : []).join("\n");
      if (picked.models && cfg.models != null) renderModels(cfg.models);
      if (picked.frp && cfg.frp) {
        if (cfg.frp.server_addr != null) $("cfg-frp-server-addr").value = cfg.frp.server_addr;
        if (cfg.frp.server_port != null) $("cfg-frp-server-port").value = cfg.frp.server_port;
        if (cfg.frp.token != null) $("cfg-frp-token").value = cfg.frp.token;
        if (cfg.frp.subdomain_host != null) $("cfg-frp-subdomain-host").value = cfg.frp.subdomain_host;
      }
      if (picked.cloud && cfg.cloud_base_url != null) $("cloud-base-url").value = cfg.cloud_base_url;
      cfgStatus(t("cfg_import_done"), "#4caf50");
    } catch (err) { cfgStatus(t("cfg_import_all_err") + ": " + err.message, "#e57373"); }
  };
  reader.readAsText(file); e.target.value = "";
};

$("cfg-save").onclick = async () => {
  cfgStatus(t("cfg_saving"));
  try {
    const r = await fetch(`/api/config${tokenQs()}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(collectConfig()) });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || t("cfg_save_err"));
    cfgStatus(t("cfg_saved"), "#4caf50");
  } catch (e) { cfgStatus(e.message, "#e57373"); }
};
$("cfg-apply").onclick = async () => {
  cfgStatus(t("cfg_applying"));
  const data = collectConfig();
  try {
    const r = await fetch(`/api/config/apply${tokenQs()}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || t("cfg_apply_err"));
    if (data.access_token !== token) token = data.access_token;
    try { populate(await fetchOptions()); } catch (e) {}
    cfgStatus(t("cfg_applied"), "#4caf50");
  } catch (e) { cfgStatus(e.message, "#e57373"); }
};

$("cfg-token-reset").onclick = async () => {
  if (!(await showConfirm(t("cfg_token_reset_confirm"), { okLabel: t("cfg_token_reset") }))) return;
  $("cfg-token-status").textContent = t("cfg_token_resetting");
  try {
    const r = await fetch(`/api/token/reset${tokenQs()}`, { method: "POST" });
    if (!r.ok) throw new Error("reset failed");
    const d = await r.json();
    token = d.token; $("cfg-token").value = d.token;
    if (localStorage.getItem("agent_token")) localStorage.setItem("agent_token", d.token);
    $("cfg-token-status").textContent = t("cfg_token_reset_done").replace("{n}", d.kicked ?? 0);
    setTimeout(() => { $("cfg-token-status").textContent = ""; }, 4000);
  } catch (e) { $("cfg-token-status").textContent = e.message; }
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
  } catch (e) {}
}
function stopCloudPoll() { if (_cloudPoll) { clearInterval(_cloudPoll); _cloudPoll = null; } }
$("cloud-connect").onclick = async () => {
  const url = $("cloud-base-url").value.trim();
  if (url) await fetch(`/api/cloud/base-url${tokenQs()}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base_url: url }) }).catch(() => {});
  const r = await fetch(`/api/cloud/device/start${tokenQs()}`, { method: "POST" });
  if (!r.ok) { cfgStatus(t("cloud_err"), "#e57373"); return; }
  const d = await r.json();
  $("cloud-usercode").textContent = d.user_code;
  const link = $("cloud-open-link");
  const verUri = typeof d.verification_uri_complete === "string" && d.verification_uri_complete.startsWith("http") ? d.verification_uri_complete : "#";
  link.href = verUri;
  $("cloud-authbox").classList.remove("hidden");
  if (verUri !== "#") window.open(verUri, "_blank", "noopener");
  const interval = Math.max(2, (d.interval || 3)) * 1000;
  stopCloudPoll();
  let expiryTimer = null;
  _cloudPoll = setInterval(async () => {
    const p = await fetch(`/api/cloud/device/poll${tokenQs()}`, { method: "POST" }).then((x) => x.json()).catch(() => ({ status: "error" }));
    if (p.status === "approved") {
      if (expiryTimer) clearTimeout(expiryTimer);
      stopCloudPoll(); $("cloud-authbox").classList.add("hidden"); cfgStatus(t("cloud_connected_ok"), "#4caf50"); await loadCloudStatus();
    } else if (p.status === "error" || p.status === "consumed") {
      if (expiryTimer) clearTimeout(expiryTimer);
      stopCloudPoll(); $("cloud-authbox").classList.add("hidden"); cfgStatus(t("cloud_err"), "#e57373");
    }
  }, interval);
  expiryTimer = setTimeout(() => { stopCloudPoll(); $("cloud-authbox").classList.add("hidden"); cfgStatus(t("cloud_err"), "#e57373"); }, Math.max(60, (d.expires_in || 600)) * 1000);
};
$("cloud-auth-cancel").onclick = () => { stopCloudPoll(); $("cloud-authbox").classList.add("hidden"); };
$("cloud-logout").onclick = async () => { await fetch(`/api/cloud/logout${tokenQs()}`, { method: "POST" }).catch(() => {}); await loadCloudStatus(); };

// Save the active session's transcript to cloud (☰ menu entry)
async function cloudSaveActive() {
  const s = getActive();
  if (!s || !s.sid) { flashCtx(t("no_active_session")); return; }
  flashCtx(t("cloud_saving"));
  try {
    const r = await fetch(`/api/cloud/sync/${encodeURIComponent(s.sid)}${tokenQs()}`, { method: "POST" });
    const body = await r.json().catch(() => ({}));
    if (r.status === 400) { flashCtx(t("cloud_not_connected")); return; }
    if (!r.ok) throw new Error(body.detail || t("cloud_save_err"));
    flashCtx(t("cloud_saved").replace("{v}", body.version ?? "?"));
  } catch (e) { flashCtx(e.message || t("cloud_save_err")); }
}
let _flashTimer = null;
function flashCtx(text) {
  $("ctx-sub").textContent = text;
  clearTimeout(_flashTimer);
  _flashTimer = setTimeout(updateCtx, 3000);
}

// ---------- External access (frp) ----------
let _etmPoll = null;
function _etmStopPoll() { if (_etmPoll) { clearInterval(_etmPoll); _etmPoll = null; } }
function _etmStartPoll() {
  _etmStopPoll();
  _etmPoll = setInterval(async () => {
    const ns = await _etmStatus().catch(() => null);
    if (ns && (ns.state === "online" || ns.state === "error" || ns.state === "stopped")) _etmStopPoll();
  }, 1000);
}
function _etmQR(elId, text) {
  const el = $(elId); if (!el) return;
  el.innerHTML = "";
  if (!text || typeof QRCode === "undefined") return;
  new QRCode(el, { text, width: 116, height: 116, correctLevel: QRCode.CorrectLevel.M });
}
function _etmRender(s) {
  const state = s.state || "stopped";
  $("etm-dot").className = "etm-dot" + (state === "stopped" ? "" : " " + state);
  const stateKey = { stopped:"etm_off", connecting:"etm_connecting", online:"etm_online", error:"etm_error" }[state] || "etm_off";
  $("etm-state").textContent = t(stateKey) + (state === "error" && s.error ? `: ${s.error}` : "");
  const on = state === "online";
  const toggle = $("etm-toggle");
  toggle.textContent = t(on || state === "connecting" ? "etm_disable" : "etm_enable");
  toggle.classList.toggle("off", !(on || state === "connecting"));
  $("etm-result").classList.toggle("show", on);
  if (on) {
    const mobileUrl = s.mobile_url || (s.url ? `${s.url}/m` : "");
    $("etm-url").value = s.url || ""; $("etm-url-m").value = mobileUrl; $("etm-token").value = s.token || "";
    _etmQR("etm-url-qr", s.url || ""); _etmQR("etm-url-m-qr", mobileUrl); _etmQR("etm-token-qr", s.token || "");
  } else { _etmQR("etm-url-qr", ""); _etmQR("etm-url-m-qr", ""); _etmQR("etm-token-qr", ""); }
}
async function _etmStatus() { const s = await fetch(`/api/frp/status${tokenQs()}`).then((r) => r.json()); _etmRender(s); return s; }
async function _etmCopy(text, okKey) {
  try { await navigator.clipboard.writeText(text); $("etm-err").textContent = t(okKey); }
  catch (e) { $("etm-err").textContent = text; }
  setTimeout(() => { $("etm-err").textContent = ""; }, 2000);
}
$("etm-toggle").onclick = async () => {
  $("etm-err").textContent = "";
  const cur = $("etm-toggle").classList.contains("off") ? "start" : "stop";
  try {
    const s = await fetch(`/api/frp/${cur}${tokenQs()}`, { method: "POST" }).then((r) => r.json());
    _etmRender(s); _etmStopPoll();
    if (s.state === "connecting") _etmStartPoll();
  } catch (e) { $("etm-err").textContent = e.message; }
};
document.querySelectorAll('#v-ext [data-copy]').forEach((btn) => { btn.onclick = () => _etmCopy($(btn.dataset.copy).value, "etm_copied"); });
$("etm-copyall").onclick = () => {
  const txt = `${t("etm_url_pc")}: ${$("etm-url").value}\n${t("etm_url_mobile")}: ${$("etm-url-m").value}\n${t("etm_token")}: ${$("etm-token").value}`;
  _etmCopy(txt, "etm_copied_all");
};
$("etm-refresh").onclick = async () => {
  $("etm-err").textContent = "";
  try {
    const r = await fetch(`/api/frp/token/refresh${tokenQs()}`, { method: "POST" }).then((x) => x.json());
    token = r.token; $("etm-token").value = r.token; _etmQR("etm-token-qr", r.token);
    $("etm-err").textContent = t("etm_saved");
    setTimeout(() => { $("etm-err").textContent = ""; }, 2000);
  } catch (e) { $("etm-err").textContent = e.message; }
};
async function loadFrpSettings() {
  try {
    const s = await fetch(`/api/frp/status${tokenQs()}`).then((r) => r.json());
    const st = s.settings || {};
    $("cfg-frp-server-addr").value = st.server_addr ?? "";
    $("cfg-frp-server-port").value = st.server_port ?? "";
    $("cfg-frp-token").value = st.token ?? "";
    $("cfg-frp-subdomain-host").value = st.subdomain_host ?? "";
  } catch (e) {}
}
$("cfg-frp-save").onclick = async () => {
  $("cfg-frp-status").textContent = "";
  try {
    await fetch(`/api/frp/settings${tokenQs()}`, { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ server_addr:$("cfg-frp-server-addr").value.trim(), server_port:$("cfg-frp-server-port").value.trim(),
        token:$("cfg-frp-token").value.trim(), subdomain_host:$("cfg-frp-subdomain-host").value.trim() }),
    }).then((r) => { if (!r.ok) throw new Error("save failed"); return r.json(); });
    $("cfg-frp-status").textContent = t("cfg_frp_saved");
    setTimeout(() => { $("cfg-frp-status").textContent = ""; }, 2500);
  } catch (e) { $("cfg-frp-status").textContent = e.message; }
};

// ---------- Resize ----------
function fitActive() {
  if (_view !== "term") return;
  const s = getActive(); if (!s) return;
  s.fitAddon.fit();
  sendTo(s, { type: "resize", cols: s.terminal.cols, rows: s.terminal.rows });
}
window.addEventListener("resize", fitActive);
if (window.visualViewport) window.visualViewport.addEventListener("resize", fitActive);

// ---------- Boot ----------
setLang(_lang);
