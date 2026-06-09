# claude-tape-web

沟通语言：**中文**

## 云端功能（本地-云端客户端）

**设计原则：** 浏览器只调本地 `/api/cloud/*` 端点，本地后端持令牌代理云端。`device_code` 仅留后端内存，不下发浏览器。

**关键文件：**
- `cloud_store.py` — 本机配置 `~/.agent_win_serve/cloud.json`（含原子写入 + 线程锁）
- `cloud_client.py` — stdlib urllib 调云端（device_start/poll/verify_token/sync）
- `cloud_routes.py` — FastAPI 路由前缀 `/api/cloud`（status/base-url/device/logout/sync/{sid}）
- `session_store.py` — 新增 `get(sid)` 方法供 sync 端点读取会话元数据

**云端 base_url 默认值：** ``

**前端入口：**
- Config View → 云端卡片：设备授权（验证码 + 轮询）、解绑
- 终端工具栏 ☁︎ 按钮：`POST /api/cloud/sync/{sid}` 将当前会话 transcript 推送到云端

**测试：** `pytest tests/` — 9 个测试（cloud_store/cloud_client/cloud_routes 各覆盖）

**前置依赖（端到端）：** 「保存到云端」端到端联调需云端 `POST /api/cloud/sync` 上线，见 `claude-tape-cloud` 仓库。

## Packaging

Use Nuitka to build a standalone exe (PyInstaller has a signal propagation bug
that kills child processes spawned via winpty/ConPTY):

```powershell
.\.venv\Scripts\python.exe -m nuitka --standalone --onefile --output-dir=dist-nuitka --include-data-dir=static=static --assume-yes-for-downloads --windows-console-mode=force --output-filename=claude-tape-web.exe __main__.py
```

Output: `dist-nuitka\claude-tape-web.exe`
