const $ = (id) => document.getElementById(id);

const TRANSLATIONS = {
  en: {
    gate_sub:"Enter server access token", gate_placeholder:"Access token",
    gate_remember:"Remember token", gate_enter:"Enter",
    gate_err_invalid:"Invalid token, please retry",
    gate_err_expired:"Saved token expired, please re-enter",
    gate_err_load:"Load failed",
    sec_new_session:"New Session", sec_history:"History",
    btn_start:"Start", btn_config:"Config", btn_back:"← Back", btn_cfg_back:"← Back",
    cfg_title:"Config", cfg_dirs_label:"project_dirs (one per line)",
    cfg_models_label:"Models", cfg_add_model:"+ Add model",
    cfg_import_model:"↑ Import", cfg_export_model:"↓ Export",
    cfg_import_err:"Import failed", cfg_save:"Save", cfg_apply:"Apply",
    cfg_loading:"Loading…", cfg_saving:"Saving…", cfg_saved:"Saved",
    cfg_save_err:"Save failed", cfg_applying:"Applying…", cfg_applied:"Applied",
    cfg_apply_err:"Apply failed", cfg_load_err:"Config load failed",
    sess_placeholder:"Unnamed", sess_activate:"Activate", sess_more:"More ▾",
    sess_save:"Save", sess_cancel:"Cancel", sess_delete:"Delete",
    lbl_note:"Note", lbl_model:"Model",
    empty_history:"No history", err_history:"Failed to load history",
    default_dir:"(default directory)", today_prefix:"Today",
    not_connected:"Not connected", connected:"Connected",
    connected_resume:"Connected (resumed)", session_ended:"Session ended",
    token_invalid:"Invalid token", disconnected:"Disconnected",
    spawn_error:"Spawn error", update_failed:"Update failed",
    confirm_delete:"Delete this session?", confirm_cancel:"Cancel", confirm_ok:"Delete",
    default_model:"Claude (local login)", builtin_tag:"Built-in", model_del:"Delete",
  },
  zh: {
    gate_sub:"请输入服务端访问令牌", gate_placeholder:"访问令牌",
    gate_remember:"记住令牌", gate_enter:"进入",
    gate_err_invalid:"令牌错误，请重试",
    gate_err_expired:"已保存令牌已失效，请重新输入",
    gate_err_load:"加载失败",
    sec_new_session:"新建会话", sec_history:"历史记录",
    btn_start:"开始", btn_config:"配置", btn_back:"← 返回", btn_cfg_back:"← 返回",
    cfg_title:"配置", cfg_dirs_label:"project_dirs（一行一个）",
    cfg_models_label:"模型列表", cfg_add_model:"+ 添加模型",
    cfg_import_model:"↑ 导入", cfg_export_model:"↓ 导出",
    cfg_import_err:"导入失败", cfg_save:"保存", cfg_apply:"应用生效",
    cfg_loading:"加载中…", cfg_saving:"保存中…", cfg_saved:"已保存",
    cfg_save_err:"保存失败", cfg_applying:"应用中…", cfg_applied:"已应用生效",
    cfg_apply_err:"应用失败", cfg_load_err:"加载配置失败",
    sess_placeholder:"未命名", sess_activate:"激活", sess_more:"更多 ▾",
    sess_save:"保存", sess_cancel:"取消", sess_delete:"删除",
    lbl_note:"备注", lbl_model:"模型",
    empty_history:"暂无历史会话", err_history:"历史加载失败",
    default_dir:"（默认目录）", today_prefix:"今天",
    not_connected:"未连接", connected:"已连接",
    connected_resume:"已连接（恢复会话）", session_ended:"会话已结束",
    token_invalid:"令牌无效", disconnected:"已断开",
    spawn_error:"启动失败", update_failed:"更新失败",
    confirm_delete:"确定要删除此会话吗？", confirm_cancel:"取消", confirm_ok:"删除",
    default_model:"官方 Claude（本机登录）", builtin_tag:"内置", model_del:"删除",
  },
};

let _lang = localStorage.getItem("agent_lang") || "en";
function t(key){ return (TRANSLATIONS[_lang] || TRANSLATIONS.en)[key] || key; }

function setLang(lang){
  _lang = lang;
  localStorage.setItem("agent_lang", lang);
  document.querySelectorAll("[data-i18n]").forEach((el)=>{ el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el)=>{ el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll(".lb[data-lang]").forEach((btn)=>{
    btn.classList.toggle("active", btn.dataset.lang === _lang);
  });
  if(!$("home").classList.contains("hidden")){ if(_lastOpts) populate(_lastOpts); renderHistory(); }
  if($("configview") && !$("configview").classList.contains("hidden")){ renderModels(_lastCfgModels); }
  if($("termview") && !$("termview").classList.contains("hidden")){ $("status").textContent = t(_statusState.key); }
}

let token = new URLSearchParams(location.search).get("token") || "";
let _lastOpts = null;
let _lastCfgModels = [];
let _statusState = { key:"not_connected", color:"" };
let _extraModels = [];
function _allModels(){ return [{id:"",name:t("default_model")}, ..._extraModels]; }
function tokenQs(){ return token ? `?token=${encodeURIComponent(token)}` : ""; }

const term = new Terminal({
  fontSize: 13,
  fontFamily: "Consolas, 'Courier New', monospace",
  cursorBlink: true,
  theme: { background:"#1e1e1e" },
});
const fit = new FitAddon.FitAddon();
term.loadAddon(fit);
let ws = null;
let _ctrlArmed = false; // used by the keys toolbar in a later task

function setStatus(key, color){
  _statusState = { key, color:color || "" };
  $("status").textContent = t(key);
  $("status").style.color = _statusState.color;
}
function send(obj){ if(ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj)); }

function esc(s){
  return String(s == null ? "" : s).replace(/[&<>"]/g,(c)=>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
}

async function fetchOptions(tok){
  const r = await fetch(`/api/project-dirs?token=${encodeURIComponent(tok)}`);
  if(r.status === 401) throw new Error(t("gate_err_invalid"));
  if(!r.ok) throw new Error(t("gate_err_load"));
  const dirs = await r.json();
  const models = await fetch(`/api/models?token=${encodeURIComponent(tok)}`).then((r)=>r.json());
  return { dirs, models };
}

function populate({ dirs, models }){
  _lastOpts = { dirs, models };
  _extraModels = models || [];
  if($("model")){
    $("model").innerHTML = _allModels().map((m)=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("");
    $("cwd").innerHTML = dirs.map((d)=>`<option value="${esc(d)}">${esc(d)}</option>`).join("");
  }
}

async function enter(tok){
  const opts = await fetchOptions(tok);
  token = tok;
  populate(opts);
  $("gate").classList.add("hidden");
  showHome();
}

$("enter").onclick = () => {
  $("gate-err").textContent = "";
  const tok = $("token-input").value.trim();
  enter(tok).then(()=>{
    if($("remember-token").checked) localStorage.setItem("agent_token", tok);
    else localStorage.removeItem("agent_token");
  }).catch((e)=>{ $("gate-err").textContent = e.message; });
};
$("token-input").addEventListener("keydown",(e)=>{ if(e.key === "Enter") $("enter").click(); });

{
  const saved = localStorage.getItem("agent_token");
  const init = saved || token;
  if(saved) $("remember-token").checked = true;
  if(init){
    enter(init).catch(()=>{
      if(saved) localStorage.removeItem("agent_token");
      $("token-input").value = init;
      $("gate-err").textContent = saved ? t("gate_err_expired") : t("gate_err_invalid");
    });
  }
}

async function showHome(){
  if($("termview")) $("termview").classList.add("hidden");
  if($("configview")) $("configview").classList.add("hidden");
  $("home").classList.remove("hidden");
  await renderHistory();
}

$("start").onclick = () => connect({
  model_id: $("model").value || undefined,
  cwd: $("cwd").value || undefined,
});
$("config").onclick = () => showConfig().catch((e)=>cfgStatus(e.message, "#e57373"));

async function patchSession(sid, body){
  const r = await fetch(`/api/sessions/${encodeURIComponent(sid)}${tokenQs()}`,{
    method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body),
  });
  if(!r.ok) throw new Error(t("update_failed"));
}

function showConfirm(msg){
  return new Promise((resolve)=>{
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `<div class="confirm-card">
      <div class="confirm-msg">${esc(msg)}</div>
      <div class="confirm-actions">
        <button class="confirm-cancel">${t("confirm_cancel")}</button>
        <button class="confirm-ok">${t("confirm_ok")}</button>
      </div></div>`;
    document.body.appendChild(overlay);
    const done = (v)=>{ overlay.remove(); resolve(v); };
    overlay.querySelector(".confirm-cancel").onclick = ()=>done(false);
    overlay.querySelector(".confirm-ok").onclick = ()=>done(true);
    overlay.addEventListener("click",(e)=>{ if(e.target === overlay) done(false); });
  });
}

function fmtWhen(iso){
  if(!iso) return "";
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  const now = new Date();
  const hm = d.toTimeString().slice(0,5);
  if(d.toDateString() === now.toDateString()) return `${t("today_prefix")} ${hm}`;
  return `${d.getMonth()+1}/${d.getDate()} ${hm}`;
}

async function renderHistory(){
  const box = $("history");
  let groups = [];
  try{ groups = await fetch(`/api/sessions${tokenQs()}`).then((r)=>r.json()); }
  catch(e){ box.innerHTML = `<div class="empty">${t("err_history")}</div>`; return; }
  if(!groups.length){ box.innerHTML = `<div class="empty">${t("empty_history")}</div>`; return; }

  box.innerHTML = groups.map((g, gi)=>{
    const cards = g.sessions.map((s)=>{
      const tag = s.tag || "";
      const modelId = s.model_id || "";
      const modelOpts = _allModels().map((m)=>
        `<option value="${esc(m.id)}"${m.id === modelId ? " selected" : ""}>${esc(m.name)}</option>`
      ).join("");
      return `<div class="scard">
        <div class="scard-top">
          <span class="dot ${s.status === "active" ? "active" : "closed"}"></span>
          <span class="when">${esc(fmtWhen(s.last_active_at))}</span>
          <button class="act" data-act="${esc(s.sid)}" data-cwd="${esc(s.cwd)}"
            data-model="${esc(modelId)}">${t("sess_activate")}</button>
        </div>
        <div class="scard-row">
          <span class="lbl">${t("lbl_note")}</span>
          <textarea class="tag-input" placeholder="${t('sess_placeholder')}" rows="1"
            data-sid="${esc(s.sid)}" data-orig="${esc(tag)}">${esc(tag)}</textarea>
          <div class="tag-btns">
            <button class="pk-ok">${t("sess_save")}</button>
            <button class="pk-cancel">${t("sess_cancel")}</button>
          </div>
        </div>
        <div class="scard-row">
          <span class="lbl">${t("lbl_model")}</span>
          <select class="m-select" data-sid="${esc(s.sid)}">${modelOpts}</select>
          <button class="mi-del" data-sid="${esc(s.sid)}">${t("sess_delete")}</button>
        </div>
      </div>`;
    }).join("");
    const label = g.cwd || t("default_dir");
    return `<div class="grp">
      <div class="grp-head" data-grp="${gi}">
        <span class="caret">▾</span><span class="path">${esc(label)}</span>
        <span class="count">${g.sessions.length}</span>
      </div>
      <div class="grp-body">${cards}</div>
    </div>`;
  }).join("");

  box.querySelectorAll(".grp-head").forEach((h)=>{
    h.onclick = ()=>{
      const body = h.nextElementSibling;
      const hidden = body.classList.toggle("hidden");
      h.querySelector(".caret").textContent = hidden ? "▸" : "▾";
    };
  });

  box.querySelectorAll("button.act").forEach((b)=>{
    b.onclick = ()=>connect({ resume:b.dataset.act, cwd:b.dataset.cwd || undefined, model_id:b.dataset.model || undefined });
  });

  box.querySelectorAll(".m-select").forEach((sel)=>{
    sel.dataset.prevIndex = String(sel.selectedIndex);
    sel.addEventListener("change", async ()=>{
      const newId = sel.value;
      const newName = sel.options[sel.selectedIndex].text;
      try{
        await patchSession(sel.dataset.sid, { model_id:newId, model_name:newName });
        sel.dataset.prevIndex = String(sel.selectedIndex);
        const card = sel.closest(".scard");
        if(card) card.querySelector("button.act").dataset.model = newId;
      }catch(_){ sel.selectedIndex = parseInt(sel.dataset.prevIndex) || 0; }
    });
  });

  box.querySelectorAll(".tag-input").forEach((inp)=>{
    const btns = inp.nextElementSibling;
    const ok = btns.querySelector(".pk-ok");
    const cancelBtn = btns.querySelector(".pk-cancel");
    const autoGrow = ()=>{ inp.style.height = "auto"; inp.style.height = inp.scrollHeight + "px"; };
    inp.addEventListener("input", autoGrow); autoGrow();
    ok.addEventListener("mousedown",(e)=>e.preventDefault());
    cancelBtn.addEventListener("mousedown",(e)=>e.preventDefault());
    const save = async ()=>{
      const newTag = inp.value.trim();
      try{ await patchSession(inp.dataset.sid,{tag:newTag}); inp.dataset.orig = newTag; inp.value = newTag; autoGrow(); }
      catch(_){ inp.value = inp.dataset.orig; autoGrow(); }
      inp.blur();
    };
    const cancel = ()=>{ inp.value = inp.dataset.orig; autoGrow(); inp.blur(); };
    ok.onclick = save; cancelBtn.onclick = cancel;
    inp.addEventListener("focus", ()=>btns.classList.add("visible"));
    inp.addEventListener("blur", ()=>{ inp.value = inp.dataset.orig; autoGrow(); btns.classList.remove("visible"); });
    inp.addEventListener("keydown",(e)=>{ if(e.key === "Escape"){ e.preventDefault(); cancel(); } });
  });

  box.querySelectorAll(".mi-del").forEach((item)=>{
    item.onclick = async ()=>{
      const confirmed = await showConfirm(t("confirm_delete"));
      if(!confirmed) return;
      await fetch(`/api/sessions/${encodeURIComponent(item.dataset.sid)}${tokenQs()}`,{ method:"DELETE" });
      renderHistory();
    };
  });
}

function connect(opts){
  $("home").classList.add("hidden");
  if($("configview")) $("configview").classList.add("hidden");
  $("termview").classList.remove("hidden");
  term.clear();
  requestAnimationFrame(()=>fit.fit());

  const proto = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${proto}://${location.host}/ws/term${tokenQs()}`);
  ws.binaryType = "arraybuffer";
  ws.onopen = ()=>{
    setStatus(opts.resume ? "connected_resume" : "connected", "#4caf50");
    fit.fit();
    send({ type:"spawn", resume:opts.resume, model_id:opts.model_id, cwd:opts.cwd, cols:term.cols, rows:term.rows });
  };
  ws.onmessage = (ev)=>{
    if(typeof ev.data === "string"){
      const msg = JSON.parse(ev.data);
      if(msg.type === "spawn_error") term.write(`\r\n[${t("spawn_error")}] ${msg.error}\r\n`);
      if(msg.type === "closed") setStatus("session_ended", "#e57373");
      return;
    }
    term.write(new Uint8Array(ev.data));
  };
  ws.onclose = (ev)=>{ setStatus(ev.code === 4003 ? "token_invalid" : "disconnected", "#e57373"); };
}

$("back").onclick = ()=>{ if(ws){ try{ ws.close(); }catch(e){} ws = null; } showHome(); };

const KEY_SEQ = {
  esc:"\x1b", tab:"\t", enter:"\r", slash:"/",
  up:"\x1b[A", down:"\x1b[B", right:"\x1b[C", left:"\x1b[D",
};

function setCtrl(v){
  _ctrlArmed = v;
  const btn = $("key-ctrl");
  if(btn) btn.classList.toggle("armed", v);
}

function initKeys(){
  document.querySelectorAll("#keys .key[data-seq]").forEach((btn)=>{
    // prevent the tap from blurring the terminal / dismissing the keyboard
    btn.addEventListener("mousedown",(e)=>e.preventDefault());
    btn.addEventListener("touchstart",(e)=>e.preventDefault(),{passive:false});
    btn.addEventListener("click",()=>{
      send({ type:"input", data:KEY_SEQ[btn.dataset.seq] });
      if(_ctrlArmed) setCtrl(false); // a non-letter key cancels the armed Ctrl
      term.focus();
    });
  });
  const ctrl = $("key-ctrl");
  ctrl.addEventListener("mousedown",(e)=>e.preventDefault());
  ctrl.addEventListener("touchstart",(e)=>e.preventDefault(),{passive:false});
  ctrl.addEventListener("click",()=>{ setCtrl(!_ctrlArmed); term.focus(); });
}
initKeys();

function cfgStatus(text, color){
  $("cfg-status").textContent = text || "";
  $("cfg-status").style.color = color || "#888";
}

function builtinModelCard(){
  return `<div class="mcard builtin" data-builtin="1" data-id="1">
    <div class="mcard-h"><span class="midx">#1</span>
      <span class="cfg-builtin-tag">${t("builtin_tag")}</span></div>
    <label>name<input class="m-name" value="${esc(t("default_model"))}" disabled /></label>
  </div>`;
}

function nextModelId(){
  const cards = [...$("cfg-models").querySelectorAll(".mcard:not([data-builtin])")];
  const max = cards.reduce((m, c)=>Math.max(m, parseInt(c.dataset.id) || 1), 1);
  return String(max + 1);
}

function modelCardHtml(m){
  m = m || {};
  const id = m.id || "";
  return `<div class="mcard" data-id="${esc(id)}">
    <div class="mcard-h"><span class="midx">#${esc(id)}</span>
      <button class="m-del">${t("model_del")}</button></div>
    <label>name<input class="m-name" placeholder="name" value="${esc(m.name)}" /></label>
    <label>api_model<input class="m-model" placeholder="api_model" value="${esc(m.model)}" /></label>
    <label>base_url<input class="m-base" placeholder="base_url" value="${esc(m.base_url)}" /></label>
    <label>auth_token<input class="m-auth" placeholder="auth_token" value="${esc(m.auth_token)}" /></label>
  </div>`;
}

function bindModelDel(){
  $("cfg-models").querySelectorAll(".m-del").forEach((b)=>{
    b.onclick = ()=>b.closest(".mcard").remove();
  });
}

function renderModels(models){
  _lastCfgModels = models || [];
  const numbered = (models || []).map((m, i)=>({ ...m, id:String(i + 2) }));
  $("cfg-models").innerHTML = builtinModelCard() + numbered.map(modelCardHtml).join("");
  bindModelDel();
}

async function showConfig(){
  $("home").classList.add("hidden");
  $("termview").classList.add("hidden");
  $("configview").classList.remove("hidden");
  cfgStatus(t("cfg_loading"));
  const cfg = await fetch(`/api/config${tokenQs()}`).then((r)=>{
    if(!r.ok) throw new Error(t("cfg_load_err"));
    return r.json();
  });
  $("cfg-claude-bin").value = cfg.claude_bin || "";
  $("cfg-token").value = cfg.access_token || "";
  $("cfg-dirs").value = (cfg.project_dirs || []).join("\n");
  renderModels(cfg.models);
  cfgStatus("");
}

function collectConfig(){
  const dirs = $("cfg-dirs").value.split(/[\n;,]/).map((s)=>s.trim()).filter(Boolean);
  const models = [...$("cfg-models").querySelectorAll(".mcard:not([data-builtin])")].map((card)=>({
    id: card.dataset.id,
    name: card.querySelector(".m-name").value.trim(),
    model: card.querySelector(".m-model").value.trim(),
    base_url: card.querySelector(".m-base").value.trim(),
    auth_token: card.querySelector(".m-auth").value.trim(),
  })).filter((m)=>m.id);
  return {
    claude_bin: $("cfg-claude-bin").value.trim() || "claude",
    access_token: $("cfg-token").value.trim(),
    project_dirs: dirs,
    models,
  };
}

$("cfg-back").onclick = ()=>showHome();
$("cfg-add-model").onclick = ()=>{
  $("cfg-models").insertAdjacentHTML("beforeend", modelCardHtml({ id:nextModelId() }));
  bindModelDel();
};
$("cfg-export-model").onclick = ()=>{
  const blob = new Blob([JSON.stringify(collectConfig().models, null, 2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "models.json"; a.click();
  URL.revokeObjectURL(a.href);
};
$("cfg-import-model").onclick = ()=>$("cfg-import-file").click();
$("cfg-import-file").onchange = (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      let data = JSON.parse(ev.target.result);
      if(!Array.isArray(data)) data = data.models || [];
      data.forEach((m)=>$("cfg-models").insertAdjacentHTML("beforeend", modelCardHtml({ ...m, id:nextModelId() })));
      bindModelDel();
    }catch(err){ cfgStatus(t("cfg_import_err") + ": " + err.message, "#e57373"); }
  };
  reader.readAsText(file);
  e.target.value = "";
};
$("cfg-save").onclick = async ()=>{
  cfgStatus(t("cfg_saving"));
  try{
    const r = await fetch(`/api/config${tokenQs()}`,{ method:"PUT",
      headers:{"Content-Type":"application/json"}, body:JSON.stringify(collectConfig()) });
    if(!r.ok) throw new Error((await r.json().catch(()=>({}))).detail || t("cfg_save_err"));
    cfgStatus(t("cfg_saved"), "#4caf50");
  }catch(e){ cfgStatus(e.message, "#e57373"); }
};
$("cfg-apply").onclick = async ()=>{
  cfgStatus(t("cfg_applying"));
  const data = collectConfig();
  try{
    const r = await fetch(`/api/config/apply${tokenQs()}`,{ method:"POST",
      headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) });
    if(!r.ok) throw new Error((await r.json().catch(()=>({}))).detail || t("cfg_apply_err"));
    if(data.access_token !== token) token = data.access_token;
    try{ populate(await fetchOptions(token)); }catch(e){}
    cfgStatus(t("cfg_applied"), "#4caf50");
  }catch(e){ cfgStatus(e.message, "#e57373"); }
};

document.querySelectorAll(".lb[data-lang]").forEach((btn)=>{
  btn.addEventListener("click",()=>setLang(btn.dataset.lang));
});
setLang(_lang);

term.open($("term"));
term.onData((d)=>{
  if(_ctrlArmed && d.length === 1){
    const code = d.toUpperCase().charCodeAt(0);
    send({ type:"input", data:String.fromCharCode(code & 0x1f) });
    setCtrl(false);
    return;
  }
  send({ type:"input", data:d });
});
window.addEventListener("resize", ()=>{ if(!$("termview").classList.contains("hidden")){ fit.fit(); send({ type:"resize", cols:term.cols, rows:term.rows }); } });
if(window.visualViewport){
  window.visualViewport.addEventListener("resize", ()=>{
    if(!$("termview").classList.contains("hidden")){
      fit.fit();
      send({ type:"resize", cols:term.cols, rows:term.rows });
    }
  });
}
