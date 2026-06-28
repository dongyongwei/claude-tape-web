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
    sec_quick_actions:"Quick Actions",
    btn_start:        "Start",
    btn_config:       "⚙ Config",
    btn_logout:       "Logout",
    logout_confirm:   "Log out and clear the saved token from this browser?",
    btn_extaccess:     "🌐 External",
    etm_title:         "External Access",
    etm_warn:          "Anyone with the share link can access your local terminal. Share privately; turn off to revoke.",
    etm_off:           "Off",
    etm_connecting:    "Connecting…",
    etm_online:        "Online",
    etm_error:         "Error",
    etm_enable:        "Enable external access",
    etm_disable:       "Turn off",
    etm_hint:          "Open the URL, then enter the access token below at the login screen.",
    etm_url_pc:        "Desktop URL",
    etm_url_mobile:    "Mobile URL (/m)",
    etm_token:         "Access token",
    etm_copy:          "Copy",
    etm_copied:        "Copied",
    etm_copy_all:      "Copy all (URLs + token)",
    etm_copied_all:    "All copied",
    tab_home:          "Home",
    tab_config:        "Config",
    tab_ext:           "External",
    tab_files:         "Files",
    btn_files:         "📁 Files",
    fm_up:             "Up",
    fm_refresh:        "Refresh",
    fm_go:             "Go",
    fm_upload:         "Upload",
    fm_mkdir:          "New folder",
    fm_name:           "Name",
    fm_size:           "Size",
    fm_mtime:          "Modified",
    fm_actions:        "Actions",
    fm_download:       "Download",
    fm_rename:         "Rename",
    fm_delete:         "Delete",
    fm_save:           "Save",
    fm_saved:          "Saved",
    fm_render:         "Preview",
    fm_source:         "Source",
    fm_empty:          "Empty folder",
    fm_pick:           "Select a file to preview",
    fm_binary:         "Cannot preview this file type — download it instead.",
    fm_drives:         "Drives",
    fm_confirm_delete: "Delete \"{0}\"? This cannot be undone.",
    fm_prompt_mkdir:   "New folder name:",
    fm_prompt_rename:  "New name:",
    fm_load_fail:      "Failed to load",
    etm_refresh:       "↻",
    etm_qr_pc:         "Scan to open (desktop)",
    etm_qr_mobile:     "Scan to open (mobile)",
    etm_qr_token:      "Scan for token",
    etm_saved:         "Saved",
    etm_close:         "Close",
    cfg_frp_title:     "External Access (frp server)",
    cfg_frp_save:      "Save server settings",
    cfg_frp_saved:     "Server settings saved",
    cfg_token_reset:   "Reset & kick all",
    cfg_token_reset_confirm: "Reset the access token and disconnect ALL logged-in clients? They will need to re-enter the new token.",
    cfg_token_resetting: "Resetting…",
    cfg_token_reset_done: "Token reset — kicked {n} connection(s)",
    btn_back:         "← Back",
    btn_cfg_back:     "← Back",
    cfg_title:        "Config",
    cfg_dirs_label:   "project_dirs (one per line)",
    cfg_models_label: "Models",
    cfg_add_model:    "+ Add model",
    cfg_import_model: "↑ Import",
    cfg_export_model: "↓ Export",
    cfg_import_err:   "Import failed",
    cfg_import_all:   "↑ Import All",
    cfg_export_all:   "↓ Export All",
    cfg_import_all_err: "Import failed",
    cfg_import_done:  "Imported — review and Save",
    cfg_pick_title_export: "Select sections to export",
    cfg_pick_title_import: "Select sections to import",
    cfg_pick_all:     "All",
    cfg_pick_ok:      "OK",
    cfg_pick_cancel:  "Cancel",
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
    shell_default:    "Default shell",
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
    tab_status:       "Status",
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
    cloud_need_url:    "Enter the cloud server URL first",
    cloud_save_title:   "Save to cloud",
    cloud_saving:       "Saving to cloud…",
    cloud_saved:        "Saved to cloud (v{v})",
    cloud_save_err:     "Save failed",
    cloud_not_connected:"Connect cloud in Config first",
    cloud_save_before_switch:"Save session to cloud before switching model?",
    cloud_save_before_ok:  "Save & Switch",
    ctx_refresh:       "Refresh tab",
    ctx_cloud_save:    "Save to cloud",
    sel_toggle:         "Select",
    sel_cancel:         "Cancel",
    sel_all:            "Select all",
    sel_none:           "Deselect all",
    sel_count:          "{n} selected",
    sel_apply_model:    "Apply",
    sel_confirm_delete: "Delete {n} selected sessions?",
    sel_confirm_activate: "Open {n} sessions as tabs?",
    sel_done:           "Done: {ok} succeeded, {fail} failed",
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
    sec_quick_actions:"常用功能",
    btn_start:        "开始",
    btn_config:       "⚙ 配置",
    btn_logout:       "退出",
    logout_confirm:   "退出登录并清除本浏览器已保存的访问令牌?",
    btn_extaccess:     "🌐 外网",
    etm_title:         "外网访问",
    etm_warn:          "任何持分享链接的人都能访问你本机的终端。请私下分享;关闭即断开公网入口。",
    etm_off:           "未开启",
    etm_connecting:    "连接中…",
    etm_online:        "已上线",
    etm_error:         "出错",
    etm_enable:        "开启外网访问",
    etm_disable:       "关闭外网访问",
    etm_hint:          "打开网址后，在登录页输入下方的访问密钥即可。",
    etm_url_pc:        "电脑端地址",
    etm_url_mobile:    "手机端地址（/m）",
    etm_token:         "访问密钥",
    etm_copy:          "复制",
    etm_copied:        "已复制",
    etm_copy_all:      "一键复制全部（网址 + 密钥）",
    etm_copied_all:    "已复制全部",
    tab_home:          "主页",
    tab_config:        "配置",
    tab_ext:           "外网",
    tab_files:         "文件",
    btn_files:         "📁 文件",
    fm_up:             "上一级",
    fm_refresh:        "刷新",
    fm_go:             "前往",
    fm_upload:         "上传",
    fm_mkdir:          "新建文件夹",
    fm_name:           "名称",
    fm_size:           "大小",
    fm_mtime:          "修改时间",
    fm_actions:        "操作",
    fm_download:       "下载",
    fm_rename:         "重命名",
    fm_delete:         "删除",
    fm_save:           "保存",
    fm_saved:          "已保存",
    fm_render:         "预览",
    fm_source:         "源码",
    fm_empty:          "空文件夹",
    fm_pick:           "选择一个文件预览",
    fm_binary:         "无法预览此类型文件，请下载查看。",
    fm_drives:         "驱动器",
    fm_confirm_delete: "确定删除「{0}」？此操作不可恢复。",
    fm_prompt_mkdir:   "新文件夹名称：",
    fm_prompt_rename:  "新名称：",
    fm_load_fail:      "加载失败",
    etm_refresh:       "↻",
    etm_qr_pc:         "扫码打开（电脑端）",
    etm_qr_mobile:     "扫码打开（手机端）",
    etm_qr_token:      "扫码获取密钥",
    etm_saved:         "已保存",
    etm_close:         "关闭",
    cfg_frp_title:     "外网访问（frp 服务器）",
    cfg_frp_save:      "保存服务器设置",
    cfg_frp_saved:     "服务器设置已保存",
    cfg_token_reset:   "重置并踢出全部",
    cfg_token_reset_confirm: "重置访问密钥并断开所有已登录客户端?他们需用新密钥重新登录。",
    cfg_token_resetting: "重置中…",
    cfg_token_reset_done: "密钥已重置 — 踢出 {n} 个连接",
    btn_back:         "← 返回",
    btn_cfg_back:     "← 返回",
    cfg_title:        "配置",
    cfg_dirs_label:   "project_dirs（一行一个）",
    cfg_models_label: "模型列表",
    cfg_add_model:    "+ 添加模型",
    cfg_import_model: "↑ 导入",
    cfg_export_model: "↓ 导出",
    cfg_import_err:   "导入失败",
    cfg_import_all:   "↑ 导入全部",
    cfg_export_all:   "↓ 导出全部",
    cfg_import_all_err: "导入失败",
    cfg_import_done:  "已导入 — 请检查后保存",
    cfg_pick_title_export: "选择要导出的配置项",
    cfg_pick_title_import: "选择要导入的配置项",
    cfg_pick_all:     "全选",
    cfg_pick_ok:      "确定",
    cfg_pick_cancel:  "取消",
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
    shell_default:    "默认 Shell",
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
    tab_status:       "状态",
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
    cloud_need_url:    "请先填写云端服务器地址",
    cloud_save_title:   "保存到云端",
    cloud_saving:       "正在保存到云端…",
    cloud_saved:        "已保存到云端（v{v}）",
    cloud_save_err:     "保存失败",
    cloud_not_connected:"请先在配置里连接云端",
    cloud_save_before_switch:"切换模型前保存会话到云端？",
    cloud_save_before_ok:  "保存并切换",
    ctx_refresh:       "刷新标签页",
    ctx_cloud_save:    "保存到云端",
    sel_toggle:         "选择",
    sel_cancel:         "取消",
    sel_all:            "全选",
    sel_none:           "取消全选",
    sel_count:          "已选 {n} 项",
    sel_apply_model:    "应用",
    sel_confirm_delete: "删除选中的 {n} 个会话？",
    sel_confirm_activate: "打开选中的 {n} 个会话标签页？",
    sel_done:           "完成：成功 {ok}，失败 {fail}",
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
  const active = getActiveTab();
  if (active) {
    if (active.type === "home") {
      if (_lastOpts) populate(_lastOpts);
      renderHistory();
    } else if (active.type === "config") {
      renderModels(_lastCfgModels);
    }
  }
  renderTabStrip();   // refresh view-type tab labels for the new language
}

// Token never travels in the URL anymore. It is held in memory (+ optional
// localStorage) and attached as `Authorization: Bearer` on every API call.
let token = "";
// Strip any legacy ?token= from the address bar (ignored, just cleaned up).
if (new URLSearchParams(location.search).has("token")) {
  history.replaceState(null, "", location.pathname);
}
let _lastOpts = null;
let _lastCfgModels = [];
let _extraModels = [];

// ---------- History multi-select state ----------
let _selectMode = false;
let _selectedSids = new Set();
let _sessionBySid = new Map();

// ---------- Multi-tab state ----------
let _tabs = [];
let _activeTabId = null;
let _tabCounter = 0;

// ---------- View tabs (home / config / extaccess) ----------
function viewLabel(type) {
  return { home: t("tab_home"), config: t("tab_config"), extaccess: t("tab_ext"), files: t("tab_files") }[type] || type;
}
function findViewTab(type) { return _tabs.find((tb) => tb.type === type) || null; }

// Open or switch to a singleton view tab; on first creation runs that view's open-hook.
async function openViewTab(type) {
  const prevActive = getActiveTab(); // capture before we activate the view tab
  let tab = findViewTab(type);
  if (tab) {
    activateTab(tab.id);
    if (type === "extaccess") {
      const s = await _etmStatus().catch((e) => { $("etm-err").textContent = e.message; });
      if (s && s.state === "connecting") _etmStartPoll();
    }
    return tab;
  }
  const panel = document.querySelector(`#tab-container > [data-view="${type}"]`);
  const id = ++_tabCounter;
  tab = { id, type, label: viewLabel(type), panel, closeable: type !== "home" };
  panel.dataset.tabId = String(id);
  _tabs.push(tab);
  activateTab(id);
  if (type === "home") {
    renderHistory();
  } else if (type === "config") {
    showConfig().catch((e) => cfgStatus(e.message, "#e57373"));
  } else if (type === "extaccess") {
    $("etm-err").textContent = "";
    const s = await _etmStatus().catch((e) => { $("etm-err").textContent = e.message; });
    if (s && s.state === "connecting") _etmStartPoll();
  } else if (type === "files") {
    // First open lands on the "current" dir: the active session's cwd if we came
    // from one, otherwise the project dir selected on the Home panel.
    let dir = (prevActive && prevActive.type === "session" && prevActive.connectOpts?.cwd) || "";
    if (!dir) dir = $("cwd")?.value || "";
    window.filesOpen?.(dir);
  }
  return tab;
}

// ---------- Tab state persistence (localStorage) ----------
const _TAB_STATE_KEY = "agent_tabs";
let _restoringTabs = false;

function _saveTabState() {
  if (_restoringTabs) return;
  const sessions = _tabs
    .filter((t) => t.type === "session" && t.sid)
    .map((t) => ({
      sid: t.sid,
      label: t.label,
      model_id: t.model_id || t.connectOpts?.model_id || "",
      cwd: t.connectOpts?.cwd || "",
    }));
  // Open singleton view tabs (config / extaccess / files). Home is always
  // recreated by initShell, so it is intentionally excluded here.
  const views = _tabs
    .filter((t) => t.type !== "session" && t.type !== "home")
    .map((t) => t.type);
  const activeId = _activeTabId;
  const activeTab = _tabs.find((t) => t.id === activeId);
  const activeSid = activeTab && activeTab.type === "session" ? activeTab.sid : null;
  const activeView =
    activeTab && activeTab.type !== "session" && activeTab.type !== "home"
      ? activeTab.type
      : null;
  try {
    localStorage.setItem(_TAB_STATE_KEY, JSON.stringify({ sessions, views, activeSid, activeView }));
  } catch (_) {}
}

async function _restoreTabs(raw) {
  if (raw == null) {
    try { raw = localStorage.getItem(_TAB_STATE_KEY); } catch (_) {}
  }
  if (!raw) return;
  let saved;
  try { saved = JSON.parse(raw); } catch (_) { return; }
  if (!saved) return;
  const savedSessions = Array.isArray(saved.sessions) ? saved.sessions : [];
  const savedViews = Array.isArray(saved.views) ? saved.views : [];
  if (!savedSessions.length && !savedViews.length) return;

  // Clear saved state immediately — if restore fails partway we don't want a loop
  localStorage.removeItem(_TAB_STATE_KEY);

  // Check which sessions still exist on the server before restoring
  let serverMap = new Map();
  if (savedSessions.length) {
    try {
      const groups = await fetch(`/api/sessions`).then((r) => r.json());
      serverMap = new Map(groups.flatMap((g) => g.sessions).map((s) => [s.sid, s]));
    } catch (_) { /* session list unavailable — still restore view tabs below */ }
  }

  let restoredActiveTabId = null;

  _restoringTabs = true;
  try {
    for (const sv of savedSessions) {
      const info = serverMap.get(sv.sid);
      if (!info) continue; // session no longer exists, skip
      const tab = createTabSession();
      tab.label = tabLabelFromTag(sv.label, tab.label);
      tab.sid = sv.sid; // mark sid early so _saveTabState captures it
      connectTab(tab, {
        resume: sv.sid,
        cwd: sv.cwd || undefined,
        model_id: sv.model_id || undefined,
      });
      if (sv.sid === saved.activeSid) restoredActiveTabId = tab.id;
    }
    // Reopen singleton view tabs (config / extaccess / files) that were open.
    for (const vt of savedViews) {
      const tab = await openViewTab(vt);
      if (tab && saved.activeView && vt === saved.activeView) restoredActiveTabId = tab.id;
    }
  } finally {
    _restoringTabs = false;
  }

  // Save the restored state (so next refresh re-opens the surviving tabs)
  _saveTabState();

  // Activate the previously-active tab, or fall back to home
  if (restoredActiveTabId) {
    activateTab(restoredActiveTabId);
  } else {
    const homeTab = findViewTab("home");
    if (homeTab) activateTab(homeTab.id);
  }
}

function initShell() {
  $("shell").classList.remove("hidden");
  // Snapshot persisted tab state BEFORE openViewTab("home") runs: it activates
  // the Home tab synchronously, and activateTab → _saveTabState() would rewrite
  // localStorage with an empty session list (no session tabs exist yet),
  // wiping exactly what we're about to restore.
  let savedRaw = null;
  try { savedRaw = localStorage.getItem(_TAB_STATE_KEY); } catch (_) {}
  openViewTab("home");
  _restoreTabs(savedRaw);
}

const _MAX_RECONNECT = 8;
const _HEARTBEAT_MS = 5_000;  // empirically: a 10s gap lets the frp HTTP proxy go idle and it
// kills the tunnel at ~40s; 5s holds indefinitely. The server answers each {type:"ping"} with a
// {type:"pong"} so data flows BOTH ways. uvicorn's own WS PING is disabled (control frames don't
// survive the frp relay, which is what made every tunnelled session drop at ~40s).

// Special shell entries: selecting one makes the backend launch a plain shell
// (cmd / powershell / system default) instead of claude.
// IDs must stay in sync with the SHELL_* constants in backend spawn.py.
function _shellModels() {
  return [
    { id: "__shell_cmd__", name: "CMD" },
    { id: "__shell_powershell__", name: "PowerShell" },
    { id: "__shell_default__", name: t("shell_default") },
  ];
}
function _allModels() { return [{ id: "", name: t("default_model") }, ..._shellModels(), ..._extraModels]; }

function getActiveTab() {
  return _tabs.find((tab) => tab.id === _activeTabId) || null;
}

// Retained as "" so existing `${tokenQs()}` call sites keep clean URLs; the
// Bearer header (injected by the fetch wrapper below) now carries the token.
function tokenQs() {
  return "";
}

// Inject `Authorization: Bearer <token>` on same-origin /api requests. WS auth is
// handled separately via Sec-WebSocket-Protocol (browsers can't set WS headers).
const _origFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : (input && input.url) || "";
  if (token && url.startsWith("/api")) {
    init = { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` } };
  }
  return _origFetch(input, init);
};

// ---------- Token Gate → Home ----------
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
  const modelSel = $("model");
  modelSel.style.display = "";
  modelSel.innerHTML = _allModels().map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("");
  $("cwd").innerHTML = dirs.map((d) => `<option value="${d}">${d}</option>`).join("");
  $("batch-model").innerHTML = _allModels().map((m) =>
    `<option value="${esc(m.id)}" data-name="${esc(m.name)}">${esc(m.name)}</option>`).join("");
}

async function enter(tok) {
  const prev = token;
  token = tok;                       // set first so the fetch wrapper authenticates
  let opts;
  try {
    opts = await fetchOptions();
  } catch (e) {
    token = prev;                    // roll back on invalid token
    throw e;
  }
  populate(opts);
  $("gate").classList.add("hidden");
  initShell();
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

async function showHome() { openViewTab("home"); }

async function renderHistory() {
  const box = $("history");
  let groups = [];
  try {
    groups = await fetch(`/api/sessions${tokenQs()}`).then((r) => r.json());
  } catch (e) {
    box.innerHTML = `<div class="empty">${t("err_history")}</div>`;
    _sessionBySid.clear();
    _selectedSids.clear();
    updateBatchBar();
    return;
  }
  if (!groups.length) {
    box.innerHTML = `<div class="empty">${t("empty_history")}</div>`;
    _sessionBySid.clear();
    _selectedSids.clear();
    updateBatchBar();
    return;
  }

  _sessionBySid.clear();
  box.innerHTML = groups.map((g, gi) => {
    const rows = g.sessions.map((s) => {
      _sessionBySid.set(s.sid, s);
      const tag = s.tag || "";
      const modelId = s.model_id || "";
      const modelOpts = _allModels().map((m) =>
        `<option value="${esc(m.id)}"${m.id === modelId ? " selected" : ""}>${esc(m.name)}</option>`
      ).join("");
      return `<div class="sess">
        <input type="checkbox" class="sess-checkbox" data-sid="${esc(s.sid)}"${_selectedSids.has(s.sid) ? " checked" : ""} />
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
            <button class="mi mi-cloud-save" data-sid="${esc(s.sid)}">${t("cloud_save_title")}</button>
            <div class="more-sep"></div>
            ${s.status === "active" ? `<button class="mi mi-close" data-sid="${esc(s.sid)}">${t("sess_close")}</button><div class="more-sep"></div>` : ""}
            <button class="mi mi-del del" data-sid="${esc(s.sid)}">${t("sess_delete")}</button>
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
          <span class="hdr-checkbox"></span>
          <span class="hdr-dot"></span>
          <span class="hdr-when">${t("hdr_time")}</span>
          <span class="hdr-model">${t("hdr_model")}</span>
          <span class="hdr-tag">${t("hdr_note")}</span>
        </div>
        ${rows}
      </div>
    </div>`;
  }).join("");

  // drop selections for sessions that no longer exist
  for (const sid of [..._selectedSids]) {
    if (!_sessionBySid.has(sid)) _selectedSids.delete(sid);
  }

  box.querySelectorAll(".sess-checkbox").forEach((cb) => {
    cb.onchange = () => {
      if (cb.checked) _selectedSids.add(cb.dataset.sid);
      else _selectedSids.delete(cb.dataset.sid);
      updateBatchBar();
    };
  });

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
        await promptCloudSaveBeforeSwitch(sid);
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
    // re-measure when width changes (window resize, group toggle, etc.)
    new ResizeObserver(autoGrow).observe(inp);

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

  box.querySelectorAll(".mi-cloud-save").forEach((item) => {
    item.onclick = async () => {
      closeAllMenus();
      const sid = item.dataset.sid;
      item.textContent = t("cloud_saving");
      item.disabled = true;
      try {
        const r = await fetch(`/api/cloud/sync/${encodeURIComponent(sid)}${tokenQs()}`, { method: "POST" });
        const body = await r.json().catch(() => ({}));
        if (r.status === 400) { item.textContent = t("cloud_not_connected"); }
        else if (!r.ok) { item.textContent = body.detail || t("cloud_save_err"); }
        else { item.textContent = t("cloud_saved").replace("{v}", body.version ?? "?"); }
      } catch (e) {
        item.textContent = e.message || t("cloud_save_err");
      } finally {
        item.disabled = false;
        setTimeout(() => { item.textContent = t("cloud_save_title"); }, 2000);
      }
    };
  });

  updateBatchBar();
}

// ---------- Home: Multi-select & batch actions ----------
function updateBatchBar() {
  const n = _selectedSids.size;
  const total = _sessionBySid.size;
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

function setBatchBusy(busy) {
  $("batch-bar").querySelectorAll(".batch-action").forEach((el) => { el.disabled = busy; });
  if (!busy) updateBatchBar();
}

function setSelectMode(on) {
  _selectMode = on;
  if (!on) _selectedSids.clear();
  $("sel-toggle").classList.toggle("active", on);
  document.querySelector('[data-view="home"]')?.classList.toggle("has-batch-bar", on);
  $("history").classList.toggle("select-mode", on);
  $("batch-bar").classList.toggle("hidden", !on);
  $("history").querySelectorAll(".sess-checkbox").forEach((cb) => {
    cb.checked = _selectedSids.has(cb.dataset.sid);
  });
  updateBatchBar();
}

$("sel-toggle").onclick = () => setSelectMode(!_selectMode);
$("batch-cancel").onclick = () => setSelectMode(false);

$("batch-select-all").onclick = () => {
  const allSelected = _selectedSids.size > 0 && _selectedSids.size === _sessionBySid.size;
  if (allSelected) _selectedSids.clear();
  else for (const sid of _sessionBySid.keys()) _selectedSids.add(sid);
  $("history").querySelectorAll(".sess-checkbox").forEach((cb) => {
    cb.checked = _selectedSids.has(cb.dataset.sid);
  });
  updateBatchBar();
};

$("batch-activate").onclick = async () => {
  const sids = [..._selectedSids];
  if (!sids.length) return;
  if (sids.length > 5) {
    const confirmed = await showConfirm(t("sel_confirm_activate").replace("{n}", String(sids.length)));
    if (!confirmed) return;
  }
  for (const sid of sids) {
    const s = _sessionBySid.get(sid);
    if (!s) continue;
    connect({ resume: sid, cwd: s.cwd || undefined, model_id: s.model_id || undefined, label: s.tag || undefined });
  }
};

$("batch-cloud-save").onclick = async () => {
  const sids = [..._selectedSids];
  if (!sids.length) return;
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
  $("batch-status").textContent = unbound
    ? t("cloud_not_connected")
    : t("sel_done").replace("{ok}", String(ok)).replace("{fail}", String(fail));
  setTimeout(() => { $("batch-status").textContent = ""; }, 4000);
};

$("batch-apply-model").onclick = async () => {
  const sids = [..._selectedSids];
  if (!sids.length) return;
  const sel = $("batch-model");
  const modelId = sel.value;
  const modelName = sel.options[sel.selectedIndex].dataset.name || "";
  setBatchBusy(true);
  let ok = 0, fail = 0;
  for (const sid of sids) {
    try { await patchSession(sid, { model_id: modelId, model_name: modelName }); ok++; }
    catch (_) { fail++; }
  }
  await renderHistory();
  $("batch-status").textContent = t("sel_done").replace("{ok}", String(ok)).replace("{fail}", String(fail));
  setTimeout(() => { $("batch-status").textContent = ""; }, 4000);
};

$("batch-close").onclick = async () => {
  const sids = [..._selectedSids].filter((sid) => _sessionBySid.get(sid)?.status === "active");
  if (!sids.length) return;
  setBatchBusy(true);
  for (const sid of sids) {
    const tab = _tabs.find((tb) => tb.sid === sid);
    if (tab) {
      tab.intentionalClose = true;
      clearTimeout(tab.reconnectTimer);
      clearInterval(tab.heartbeat);
      if (tab.ws) { try { tab.ws.close(); } catch (_) {} }
    }
    await fetch(`/api/sessions/${encodeURIComponent(sid)}/close${tokenQs()}`, { method: "POST" }).catch(() => {});
  }
  await renderHistory();
};

$("batch-delete").onclick = async () => {
  const sids = [..._selectedSids];
  if (!sids.length) return;
  const confirmed = await showConfirm(t("sel_confirm_delete").replace("{n}", String(sids.length)));
  if (!confirmed) return;
  setBatchBusy(true);
  for (const sid of sids) {
    await fetch(`/api/sessions/${encodeURIComponent(sid)}${tokenQs()}`, { method: "DELETE" }).catch(() => {});
    _selectedSids.delete(sid);
  }
  await renderHistory();
};

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
  $("tab-container").appendChild(panel);

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
    type: "session",
    closeable: true,
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
  // Status is no longer shown in the top bar; it's viewable on demand via the
  // session tab's right-click context menu. Just persist it on the tab.
  tab.statusKey = key;
  tab.statusColor = color || "";
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
    if (tab.type === "session") {
      tab.fitAddon.fit();
    }
  }
  renderTabStrip();
  _saveTabState();
}

function closeTab(id) {
  const idx = _tabs.findIndex((tab) => tab.id === id);
  if (idx === -1) return;
  const tab = _tabs[idx];
  if (tab.closeable === false) return;          // Home tab is never closable

  if (tab.type === "session") {
    tab.intentionalClose = true;
    clearTimeout(tab.reconnectTimer);
    clearInterval(tab.heartbeat);
    if (tab.ws) { try { tab.ws.close(); } catch (e) {} }
    tab.terminal.dispose();
    tab.panel.remove();
  } else {
    // view tab: just hide the panel, keep the DOM so reopening preserves state
    tab.panel.classList.add("hidden");
    if (tab.type === "config") stopCloudPoll();
    if (tab.type === "extaccess") _etmStopPoll();
  }
  _tabs.splice(idx, 1);

  // _tabs always retains Home, so it can never be empty
  if (_activeTabId === id) {
    const newIdx = Math.min(idx, _tabs.length - 1);
    activateTab(_tabs[newIdx].id);
  } else {
    renderTabStrip();
  }
  _saveTabState();
}

function renderTabStrip() {
  const strip = $("tab-strip");
  strip.innerHTML = _tabs.map((tab) => {
    const active = tab.id === _activeTabId ? " active" : "";
    const label = tab.type === "session" ? tab.label : viewLabel(tab.type);
    const close = tab.closeable === false
      ? "" : `<button class="tab-close" data-close-tab="${tab.id}">×</button>`;
    return `<div class="tab-btn${active}" data-tab-id="${tab.id}">
      <span class="tab-label">${esc(label)}</span>${close}
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
        _saveTabState();
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

  // ---------- Tab Context Menu (right-click) ----------
  const ctxMenu = $("tab-ctx-menu");

  strip.addEventListener("contextmenu", async (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    e.preventDefault();

    const tabId = parseInt(btn.dataset.tabId);
    const tab = _tabs.find((t) => t.id === tabId);
    if (!tab) return;

    // Build menu items
    let html = `<button class="tmi" data-ctx="refresh" data-ctx-tab="${tabId}">
      <span class="ctx-icon">↻</span>${t("ctx_refresh")}
    </button>`;

    if (tab.type === "session") {
      // Status display row (read-only) — moved here from the top bar
      const stColor = tab.statusColor || "var(--t3)";
      html += `<div class="tab-ctx-sep"></div>
        <div class="tab-ctx-status-row">
          <span class="ctx-status-dot" style="background:${esc(stColor)}"></span>
          <span class="ctx-status-label">${t("tab_status")}</span>
          <span class="ctx-status-val" style="color:${esc(stColor)}">${t(tab.statusKey || "not_connected")}</span>
        </div>`;

      // Working directory row
      const cwd = tab.connectOpts?.cwd || "";
      if (cwd) {
        html += `<div class="tab-ctx-sep"></div>
          <div class="tab-ctx-cwd-row" title="${esc(cwd)}">
            <span class="ctx-icon">📁</span>
            <span class="ctx-cwd-path">${esc(cwd)}</span>
          </div>`;
      }

      // Model select row (inline in context menu)
      try {
        const models = await fetch(`/api/models${tokenQs()}`).then((r) => r.json());
        _extraModels = models || [];
      } catch (_) {}
      const modelOpts = _allModels().map((m) =>
        `<option value="${esc(m.id)}"${m.id === (tab.model_id || "") ? " selected" : ""}>${esc(m.name)}</option>`
      ).join("");
      html += `<div class="tab-ctx-sep"></div>
        <div class="tab-ctx-model-row">
          <span>${t("tab_model")}</span>
          <select data-ctx="model" data-ctx-tab="${tabId}" data-prev-model="${esc(tab.model_id || "")}">${modelOpts}</select>
        </div>`;

      if (tab.sid) {
        html += `<div class="tab-ctx-sep"></div>
          <button class="tmi" data-ctx="cloud-save" data-ctx-tab="${tabId}">
            <span class="ctx-icon">☁</span>${t("ctx_cloud_save")}
          </button>`;
      }
      html += `<button class="tmi" data-ctx="rename" data-ctx-tab="${tabId}">
        <span class="ctx-icon">✏</span>${t("tab_rename")}
      </button>`;
      html += `<div class="tab-ctx-sep"></div>
        <button class="tmi tmi-danger" data-ctx="delete" data-ctx-tab="${tabId}">
          <span class="ctx-icon">🗑</span>${t("sess_delete")}
        </button>`;
    }

    ctxMenu.innerHTML = html;
    ctxMenu.classList.remove("hidden");

    // Position at cursor, keep inside viewport
    const mw = ctxMenu.offsetWidth;
    const mh = ctxMenu.offsetHeight;
    let x = e.clientX;
    let y = e.clientY;
    if (x + mw > window.innerWidth - 8) x = window.innerWidth - mw - 8;
    if (y + mh > window.innerHeight - 8) y = window.innerHeight - mh - 8;
    ctxMenu.style.left = x + "px";
    ctxMenu.style.top = y + "px";
  });

  // Handle context menu item clicks
  ctxMenu.addEventListener("click", async (e) => {
    const item = e.target.closest(".tmi");
    if (!item) return;
    const action = item.dataset.ctx;
    const tabId = parseInt(item.dataset.ctxTab);
    const tab = _tabs.find((t) => t.id === tabId);
    closeAllMenus();
    if (!tab) return;

    if (action === "refresh") {
      if (tab.type === "session") {
        // Reconnect the session
        if (tab.sid) {
          await fetch(`/api/sessions/${encodeURIComponent(tab.sid)}/close${tokenQs()}`, { method: "POST" }).catch(() => {});
        }
        tab.intentionalClose = true;
        clearTimeout(tab.reconnectTimer);
        clearInterval(tab.heartbeat);
        if (tab.ws) { try { tab.ws.close(); } catch (_) {} }
        tab.terminal.clear();
        connectTab(tab, { ...tab.connectOpts, resume: tab.sid, model_id: tab.model_id });
      } else if (tab.type === "extaccess") {
        const s = await _etmStatus().catch(() => null);
        if (s && s.state === "connecting") _etmStartPoll();
      }
    }

    if (action === "cloud-save" && tab.sid) {
      toast(t("cloud_saving"));
      try {
        const r = await fetch(`/api/cloud/sync/${encodeURIComponent(tab.sid)}${tokenQs()}`, { method: "POST" });
        const body = await r.json().catch(() => ({}));
        if (r.status === 400) { toast(t("cloud_not_connected"), "#e57373"); return; }
        if (!r.ok) throw new Error(body.detail || t("cloud_save_err"));
        toast(t("cloud_saved").replace("{v}", body.version ?? "?"), "#4caf50");
      } catch (err) {
        toast(err.message || t("cloud_save_err"), "#e57373");
      }
    }

    if (action === "rename") {
      startRenameTab(tabId);
    }

    if (action === "delete") {
      const confirmed = await showConfirm(t("confirm_delete"));
      if (!confirmed) return;
      const sid = tab.sid;
      closeTab(tabId);
      if (sid) {
        await fetch(`/api/sessions/${encodeURIComponent(sid)}${tokenQs()}`, { method: "DELETE" }).catch(() => {});
        renderHistory();
      }
    }
  });

  // Model select change (inside context menu, uses "change" not "click")
  ctxMenu.addEventListener("change", async (e) => {
    const sel = e.target.closest("select[data-ctx='model']");
    if (!sel) return;
    const tabId = parseInt(sel.dataset.ctxTab);
    const tab = _tabs.find((t) => t.id === tabId);
    if (!tab) return;
    const newId = sel.value;
    const newName = sel.options[sel.selectedIndex].text;
    const prevModel = sel.dataset.prevModel;
    closeAllMenus();
    if (tab.sid && newId !== prevModel) await promptCloudSaveBeforeSwitch(tab.sid);
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
      sel.value = prevModel;
      tab.model_id = prevModel;
    }
  });

  // Close context menu on scroll or Escape
  document.addEventListener("scroll", closeAllMenus, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAllMenus(); });
})();

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
    if (!_tabs.includes(tab)) {
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
  const wsUrl = `${proto}://${location.host}/ws/term`;
  // token carried as Sec-WebSocket-Protocol ["bearer", token] (not in the URL)
  tab.ws = token ? new WebSocket(wsUrl, ["bearer", token]) : new WebSocket(wsUrl);
  tab.ws.binaryType = "arraybuffer";

  tab.ws.onopen = (ev) => {
    if (ev.target !== tab.ws) return;
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
    // Ignore messages from a stale (previous) WS.
    if (ev.target !== tab.ws) return;
    if (typeof ev.data === "string") {
      const msg = JSON.parse(ev.data);
      if (msg.type === "spawned") {
        tab.sid = msg.sid;
        _saveTabState();
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
    // Ignore close from a stale (previous) WS — only the current WS matters.
    if (ev.target !== tab.ws) return;
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
  const tab = createTabSession();
  if (opts && opts.label) tab.label = tabLabelFromTag(opts.label, tab.label);
  activateTab(tab.id);
  connectTab(tab, opts);
}

$("start").onclick = () => connect({
  model_id: $("model").value || undefined,
  cwd: $("cwd").value || undefined,
});

// ---------- New Tab Modal ----------
$("tab-add").onclick = async () => {
  $("ntm-model").innerHTML = `<option disabled selected>…</option>`;
  $("ntm-cwd").innerHTML   = `<option disabled selected>…</option>`;
  $("ntm").classList.remove("hidden");
  try {
    const [dirs, models] = await Promise.all([
      fetch(`/api/project-dirs${tokenQs()}`).then((r) => r.json()),
      fetch(`/api/models${tokenQs()}`).then((r) => r.json()),
    ]);
    _extraModels = models || [];
    $("ntm-model").innerHTML = _allModels().map((m) =>
      `<option value="${esc(m.id)}">${esc(m.name)}</option>`
    ).join("");
    $("ntm-cwd").innerHTML = (dirs || []).map((d) =>
      `<option value="${d}">${d}</option>`
    ).join("");
  } catch (_) {
    if (_lastOpts) {
      $("ntm-model").innerHTML = _allModels().map((m) =>
        `<option value="${esc(m.id)}">${esc(m.name)}</option>`
      ).join("");
      $("ntm-cwd").innerHTML = (_lastOpts.dirs || []).map((d) =>
        `<option value="${d}">${d}</option>`
      ).join("");
    }
  }
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
  await loadFrpSettings();
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

$("config").onclick = () => openViewTab("config");
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

/* ---- full config import / export (with picker) ---- */

function showPicker(title, sections) {
  // sections: [{ key, label, checked }]
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "picker-overlay";
    const items = sections.map((s) =>
      `<div class="picker-item">
        <input type="checkbox" id="_pk_${s.key}" data-key="${s.key}" ${s.checked ? "checked" : ""} />
        <label for="_pk_${s.key}">${esc(s.label)}</label>
      </div>`
    ).join("");
    overlay.innerHTML = `<div class="picker-card">
      <div class="picker-title">${esc(title)}</div>
      <div class="picker-list">
        <div class="picker-item">
          <input type="checkbox" id="_pk_all" checked />
          <label for="_pk_all"><b>${esc(t("cfg_pick_all"))}</b></label>
        </div>
        <div class="picker-sep"></div>
        ${items}
      </div>
      <div class="picker-actions">
        <button class="picker-cancel">${esc(t("cfg_pick_cancel"))}</button>
        <button class="picker-ok">${esc(t("cfg_pick_ok"))}</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);

    const allCb = overlay.querySelector("#_pk_all");
    const cbs = [...overlay.querySelectorAll("[data-key]")];
    allCb.onchange = () => cbs.forEach((cb) => { cb.checked = allCb.checked; });
    cbs.forEach((cb) => { cb.onchange = () => { allCb.checked = cbs.every((c) => c.checked); }; });

    const done = (map) => { overlay.remove(); resolve(map); };
    overlay.querySelector(".picker-cancel").onclick = () => done(null);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) done(null); });
    const onKey = (e) => { if (e.key === "Escape") { done(null); document.removeEventListener("keydown", onKey); } };
    document.addEventListener("keydown", onKey);
    overlay.querySelector(".picker-ok").onclick = () => {
      const map = {};
      cbs.forEach((cb) => { map[cb.dataset.key] = cb.checked; });
      done(map);
    };
  });
}

const CFG_SECTIONS = [
  { key: "claude_bin",   label: "claude_bin" },
  { key: "access_token", label: "access_token" },
  { key: "project_dirs", label: "project_dirs" },
  { key: "models",       label: "Models" },
  { key: "frp",          label: "External Access (frp)" },
  { key: "cloud",        label: "Cloud base_url" },
];

const CFG_SECTIONS_MAP = {};
CFG_SECTIONS.forEach((s) => { CFG_SECTIONS_MAP[s.key] = s; });

$("cfg-export-all").onclick = async () => {
  const cfg = collectConfig();
  cfg.frp = {
    server_addr:    $("cfg-frp-server-addr").value.trim(),
    server_port:    $("cfg-frp-server-port").value.trim(),
    token:          $("cfg-frp-token").value.trim(),
    subdomain_host: $("cfg-frp-subdomain-host").value.trim(),
  };
  cfg.cloud_base_url = $("cloud-base-url").value.trim();

  const sections = CFG_SECTIONS.map((s) => ({ ...s, checked: true }));
  const picked = await showPicker(t("cfg_pick_title_export"), sections);
  if (!picked) return;

  const out = {};
  Object.keys(picked).forEach((k) => { if (picked[k] && cfg[k] != null) out[k] = cfg[k]; });
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "claude-tape-config.json"; a.click();
  URL.revokeObjectURL(a.href);
};

$("cfg-import-all").onclick = () => $("cfg-import-all-file").click();

$("cfg-import-all-file").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const cfg = JSON.parse(ev.target.result);
      const sections = CFG_SECTIONS
        .filter((s) => cfg[s.key] != null)
        .map((s) => ({ ...s, checked: true }));
      if (!sections.length) { cfgStatus(t("cfg_import_all_err"), "#e57373"); return; }

      const picked = await showPicker(t("cfg_pick_title_import"), sections);
      if (!picked) return;

      if (picked.claude_bin && cfg.claude_bin != null)
        $("cfg-claude-bin").value = cfg.claude_bin;
      if (picked.access_token && cfg.access_token != null)
        $("cfg-token").value = cfg.access_token;
      if (picked.project_dirs && cfg.project_dirs != null)
        $("cfg-dirs").value = (Array.isArray(cfg.project_dirs) ? cfg.project_dirs : []).join("\n");
      if (picked.models && cfg.models != null)
        renderModels(cfg.models);
      if (picked.frp && cfg.frp) {
        if (cfg.frp.server_addr != null)    $("cfg-frp-server-addr").value = cfg.frp.server_addr;
        if (cfg.frp.server_port != null)    $("cfg-frp-server-port").value = cfg.frp.server_port;
        if (cfg.frp.token != null)          $("cfg-frp-token").value = cfg.frp.token;
        if (cfg.frp.subdomain_host != null) $("cfg-frp-subdomain-host").value = cfg.frp.subdomain_host;
      }
      if (picked.cloud && cfg.cloud_base_url != null)
        $("cloud-base-url").value = cfg.cloud_base_url;
      cfgStatus(t("cfg_import_done"), "#4caf50");
    } catch (err) {
      cfgStatus(t("cfg_import_all_err") + ": " + err.message, "#e57373");
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
    try { populate(await fetchOptions()); } catch (e) {}
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
  if (!url) { cfgStatus(t("cloud_need_url"), "#e57373"); return; }
  await fetch(`/api/cloud/base-url${tokenQs()}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_url: url }),
  }).catch(() => {});

  const r = await fetch(`/api/cloud/device/start${tokenQs()}`, { method: "POST" });
  if (!r.ok) { cfgStatus(t("cloud_err"), "#e57373"); return; }
  const d = await r.json();
  $("cloud-usercode").textContent = d.user_code;
  const link = $("cloud-open-link");
  const verUri = typeof d.verification_uri_complete === "string" &&
    d.verification_uri_complete.startsWith("http")
    ? d.verification_uri_complete : "#";
  link.href = verUri;
  $("cloud-authbox").classList.remove("hidden");
  if (verUri !== "#") window.open(verUri, "_blank", "noopener");

  const interval = Math.max(2, (d.interval || 3)) * 1000;
  stopCloudPoll();
  let _expiryTimer = null;
  _cloudPoll = setInterval(async () => {
    const p = await fetch(`/api/cloud/device/poll${tokenQs()}`, { method: "POST" })
      .then((x) => x.json()).catch(() => ({ status: "error" }));
    if (p.status === "approved") {
      if (_expiryTimer) { clearTimeout(_expiryTimer); _expiryTimer = null; }
      stopCloudPoll();
      $("cloud-authbox").classList.add("hidden");
      cfgStatus(t("cloud_connected_ok"), "#4caf50");
      await loadCloudStatus();
    } else if (p.status === "error" || p.status === "consumed") {
      if (_expiryTimer) { clearTimeout(_expiryTimer); _expiryTimer = null; }
      stopCloudPoll();
      $("cloud-authbox").classList.add("hidden");
      cfgStatus(t("cloud_err"), "#e57373");
    }
  }, interval);
  const expiresMs = Math.max(60, (d.expires_in || 600)) * 1000;
  _expiryTimer = setTimeout(() => {
    stopCloudPoll();
    $("cloud-authbox").classList.add("hidden");
    cfgStatus(t("cloud_err"), "#e57373");
  }, expiresMs);
};

$("cloud-auth-cancel").onclick = () => {
  stopCloudPoll();
  $("cloud-authbox").classList.add("hidden");
};

$("cloud-logout").onclick = async () => {
  await fetch(`/api/cloud/logout${tokenQs()}`, { method: "POST" }).catch(() => {});
  await loadCloudStatus();
};

/** Check if cloud is connected; if so, ask whether to save before model switch.
 *  Returns true if save succeeded or user declined; false if user cancelled the whole switch. */
async function promptCloudSaveBeforeSwitch(sid) {
  if (!sid) return true;
  try {
    const s = await fetch(`/api/cloud/status${tokenQs()}`).then((r) => r.json());
    if (!s.bound) return true;   // cloud not connected → skip prompt
  } catch (_) { return true; }   // can't check → skip prompt
  const save = await showConfirm(t("cloud_save_before_switch"), { okLabel: t("cloud_save_before_ok") });
  if (!save) return true;        // user declined save → proceed with switch
  toast(t("cloud_saving"));
  try {
    const r = await fetch(`/api/cloud/sync/${encodeURIComponent(sid)}${tokenQs()}`, { method: "POST" });
    const body = await r.json().catch(() => ({}));
    if (r.status === 400) { toast(t("cloud_not_connected"), "#e57373"); }
    else if (!r.ok) { toast(body.detail || t("cloud_save_err"), "#e57373"); }
    else { toast(t("cloud_saved").replace("{v}", body.version ?? "?"), "#4caf50"); }
  } catch (e) { toast(e.message || t("cloud_save_err"), "#e57373"); }
  return true; // always proceed with switch (save succeeded or failed gracefully)
}

// ---------- Toast (transient bottom-center notice) ----------
function toast(text, color) {
  let el = $("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.color = color || "";
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 2500);
}

// ---------- Resize ----------
window.addEventListener("resize", () => {
  const tab = getActiveTab();
  if (!tab || tab.type !== "session") return;
  tab.fitAddon.fit();
  sendToTab(tab, { type: "resize", cols: tab.terminal.cols, rows: tab.terminal.rows });
});

// ---------- Menus ----------
function closeAllMenus() {
  document.querySelectorAll(".more-drop").forEach((d) => d.classList.add("hidden"));
  $("tab-ctx-menu").classList.add("hidden");
}
document.addEventListener("click", (e) => {
  // Clicks inside a menu (e.g. opening the model <select> dropdown) must not
  // trigger the global close — menu items close the menu themselves.
  if (e.target.closest && e.target.closest("#tab-ctx-menu, .more-drop")) return;
  closeAllMenus();
});

// ---------- Top bar launchers ----------
$("open-config").onclick = () => openViewTab("config");
$("open-ext").onclick = () => openViewTab("extaccess");
$("files").onclick = () => openViewTab("files");

// ---------- Language Switcher ----------
document.querySelectorAll(".lb[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

// ---------- Logout ----------
// Clears the saved token from this browser (localStorage + in-memory) and
// reloads, which drops all in-memory state (tabs/WS) and re-shows the gate.
$("logout").addEventListener("click", async () => {
  if (!(await showConfirm(t("logout_confirm")))) return;
  localStorage.removeItem("agent_token");
  localStorage.removeItem(_TAB_STATE_KEY);
  token = "";
  location.reload();
});

// ---------- External Access ----------
let _etmPoll = null;

function _etmStopPoll() { if (_etmPoll) { clearInterval(_etmPoll); _etmPoll = null; } }

function _etmStartPoll() {
  _etmStopPoll();
  _etmPoll = setInterval(async () => {
    const ns = await _etmStatus().catch(() => null);
    if (ns && (ns.state === "online" || ns.state === "error" || ns.state === "stopped")) _etmStopPoll();
  }, 1000);
}

// Render an offline QR code (qrcodejs, vendored) into a container; clears if no text.
function _etmQR(elId, text) {
  const el = $(elId);
  if (!el) return;
  el.innerHTML = "";
  if (!text || typeof QRCode === "undefined") return;
  new QRCode(el, { text, width: 116, height: 116, correctLevel: QRCode.CorrectLevel.M });
}

function _etmRender(s) {
  const state = s.state || "stopped";
  const dot = $("etm-dot");
  dot.className = "etm-dot" + (state === "stopped" ? "" : " " + state);
  const stateKey = { stopped: "etm_off", connecting: "etm_connecting",
                     online: "etm_online", error: "etm_error" }[state] || "etm_off";
  $("etm-state").textContent = t(stateKey) + (state === "error" && s.error ? `: ${s.error}` : "");
  const on = state === "online";
  const toggle = $("etm-toggle");
  toggle.textContent = t(on || state === "connecting" ? "etm_disable" : "etm_enable");
  toggle.classList.toggle("off", !(on || state === "connecting"));
  $("etm-result").classList.toggle("show", on);
  if (on) {
    const mobileUrl = s.mobile_url || (s.url ? `${s.url}/m` : "");
    $("etm-url").value = s.url || "";
    $("etm-url-m").value = mobileUrl;
    $("etm-token").value = s.token || "";
    _etmQR("etm-url-qr", s.url || "");        // PC URL, no token
    _etmQR("etm-url-m-qr", mobileUrl);        // mobile URL (/m), no token
    _etmQR("etm-token-qr", s.token || "");    // token only — scan/enter at the gate
  } else {
    _etmQR("etm-url-qr", "");
    _etmQR("etm-url-m-qr", "");
    _etmQR("etm-token-qr", "");
  }
}

async function _etmStatus() {
  const s = await fetch(`/api/frp/status${tokenQs()}`).then((r) => r.json());
  _etmRender(s);
  return s;
}

async function _etmCopy(text, okKey) {
  try { await navigator.clipboard.writeText(text); $("etm-err").textContent = t(okKey); }
  catch (e) { $("etm-err").textContent = text; }
  setTimeout(() => { $("etm-err").textContent = ""; }, 2000);
}

$("extaccess").onclick = () => openViewTab("extaccess");

$("etm-close").onclick = () => { const tab = findViewTab("extaccess"); if (tab) closeTab(tab.id); };

$("etm-toggle").onclick = async () => {
  $("etm-err").textContent = "";
  const cur = $("etm-toggle").classList.contains("off") ? "start" : "stop";
  try {
    const s = await fetch(`/api/frp/${cur}${tokenQs()}`, { method: "POST" }).then((r) => r.json());
    _etmRender(s);
    _etmStopPoll();
    if (s.state === "connecting") _etmStartPoll();
  } catch (e) { $("etm-err").textContent = e.message; }
};

document.querySelector('[data-view="extaccess"]').querySelectorAll("[data-copy]").forEach((btn) => {
  btn.onclick = () => _etmCopy($(btn.dataset.copy).value, "etm_copied");
});

$("etm-copyall").onclick = () => {
  const txt = `${t("etm_url_pc")}: ${$("etm-url").value}\n`
            + `${t("etm_url_mobile")}: ${$("etm-url-m").value}\n`
            + `${t("etm_token")}: ${$("etm-token").value}`;
  _etmCopy(txt, "etm_copied_all");
};

$("etm-refresh").onclick = async () => {
  $("etm-err").textContent = "";
  try {
    const r = await fetch(`/api/frp/token/refresh${tokenQs()}`, { method: "POST" }).then((x) => x.json());
    token = r.token;                       // sync frontend access token so later requests aren't rejected
    $("etm-token").value = r.token;
    _etmQR("etm-token-qr", r.token);       // token QR only; URLs never carry the token
    $("etm-err").textContent = t("etm_saved");
    setTimeout(() => { $("etm-err").textContent = ""; }, 2000);
  } catch (e) { $("etm-err").textContent = e.message; }
};

// frp server settings live on the Config page (loaded with the rest of the config)
async function loadFrpSettings() {
  try {
    const s = await fetch(`/api/frp/status${tokenQs()}`).then((r) => r.json());
    const st = s.settings || {};
    $("cfg-frp-server-addr").value    = st.server_addr ?? "";
    $("cfg-frp-server-port").value    = st.server_port ?? "";
    $("cfg-frp-token").value          = st.token ?? "";
    $("cfg-frp-subdomain-host").value = st.subdomain_host ?? "";
  } catch (e) { /* leave fields blank if status unavailable */ }
}

$("cfg-frp-save").onclick = async () => {
  $("cfg-frp-status").textContent = "";
  try {
    await fetch(`/api/frp/settings${tokenQs()}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        server_addr: $("cfg-frp-server-addr").value.trim(),
        server_port: $("cfg-frp-server-port").value.trim(),
        token: $("cfg-frp-token").value.trim(),
        subdomain_host: $("cfg-frp-subdomain-host").value.trim(),
      }),
    }).then((r) => { if (!r.ok) throw new Error("save failed"); return r.json(); });
    $("cfg-frp-status").textContent = t("cfg_frp_saved");
    setTimeout(() => { $("cfg-frp-status").textContent = ""; }, 2500);
  } catch (e) { $("cfg-frp-status").textContent = e.message; }
};

// Reset the access token and kick all logged-in clients (force re-authentication)
$("cfg-token-reset").onclick = async () => {
  const confirmed = await showConfirm(t("cfg_token_reset_confirm"), { okLabel: t("cfg_token_reset") });
  if (!confirmed) return;
  $("cfg-token-status").textContent = t("cfg_token_resetting");
  try {
    const r = await fetch(`/api/token/reset${tokenQs()}`, { method: "POST" });
    if (!r.ok) throw new Error("reset failed");
    const d = await r.json();
    token = d.token;                                   // keep this admin browser authenticated
    $("cfg-token").value = d.token;
    if (localStorage.getItem("agent_token")) localStorage.setItem("agent_token", d.token);
    $("cfg-token-status").textContent = t("cfg_token_reset_done").replace("{n}", d.kicked ?? 0);
    setTimeout(() => { $("cfg-token-status").textContent = ""; }, 4000);
  } catch (e) { $("cfg-token-status").textContent = e.message; }
};

setLang(_lang);
