<p align="center">
  <h1 align="center">Claude Tape Web</h1>
</p>

<p align="center">
  <strong>English</strong>
  &nbsp;·&nbsp;
  <a href="./README_CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://github.com/dongyongwei/claude-tape-web/stargazers"><img src="https://img.shields.io/github/stars/dongyongwei/claude-tape-web.svg?style=flat-square&color=dbab09&labelColor=161b22&logo=github&logoColor=white" alt="GitHub stars"/></a>
  <a href="https://github.com/dongyongwei/claude-tape-web/network/members"><img src="https://img.shields.io/github/forks/dongyongwei/claude-tape-web.svg?style=flat-square&color=8b949e&labelColor=161b22&logo=github&logoColor=white" alt="GitHub forks"/></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/dongyongwei/claude-tape-web.svg?style=flat-square&color=8b949e&labelColor=161b22" alt="license"/></a>
  <a href="https://github.com/dongyongwei/claude-tape-web/issues"><img src="https://img.shields.io/github/issues/dongyongwei/claude-tape-web.svg?style=flat-square&color=3fb950&labelColor=161b22&logo=github&logoColor=white" alt="GitHub issues"/></a>
  <a href="https://github.com/dongyongwei/claude-tape-web/graphs/contributors"><img src="https://img.shields.io/github/contributors/dongyongwei/claude-tape-web.svg?style=flat-square&color=bc8cff&labelColor=161b22&logo=github&logoColor=white" alt="contributors"/></a>
</p>

<br/>

<h3 align="center">Claude Code Web Terminal</h3>
<p align="center">Single-process integration of agent + WSS service + static pages, browser connects directly to local Claude Code terminal.</p>

<br/>

## Core Features

- **Web Terminal**: Browser-based terminal built on xterm.js, full PTY interaction
- **Multi-Session**: Run multiple Claude Code sessions simultaneously
- **Multi-Model**: Support for third-party Anthropic-compatible endpoints (Kimi K2, Zhipu GLM, etc.)
- **Access Control**: Simple token-based authentication to prevent unauthorized access
- **Session Persistence**: Local session index storage with history viewing
- **Visual Configuration**: In-page configuration editing with hot-reload
- **Mobile Friendly**: Dedicated mobile-optimized interface accessible via `/m` path

## Project Highlights

### Session Index Persistence
- Session information automatically saved to `~/.agent_win_serve/sessions/` directory
- Grouped by project working directory, each session stored as independent JSON file
- Records session status, model information, creation time, last active time
- Supports session list viewing, tag editing, and deletion management

### Session Activation & Model Switching
- Supports reactivating historical sessions with full context to continue conversations
- Can switch third-party models during activation without restarting
- PTY process runs continuously in background, WebSocket disconnection doesn't affect session
- Supports precise restoration (`--resume`) and continuing latest conversation (`--continue`)

### Third-Party Model Hot-Reload
- Configuration file takes effect immediately after saving, no service restart required
- Supports adding, modifying, deleting third-party model configurations at runtime
- Model configurations injected into PTY process via environment variables, isolated and secure
- Built-in model (Official Claude) coexists with third-party models, flexible switching

### Model Configuration Import/Export
- Supports exporting third-party model configurations as JSON files for backup
- Supports importing model configurations from JSON files, one-click restoration after switching computers
- Import/export functions directly in settings interface, no manual configuration file editing required

## Quick Start

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Start Service
```bash
python __main__.py
```

First startup will randomly generate an access token, please save it properly. After startup, multiple access modes will be displayed:
- **Local Access**: http://127.0.0.1:8009
- **LAN Access**: http://<your-ip>:8009
- **External Access**: http://0.0.0.0:8009 (all network interfaces)

### Access Page
Enter the access token to use.

**PC Web Interface**:
![PC Web Interface](doc_data/web-pc.png)

**Multi-Tab Operation**:
![Multi-Tab Operation](doc_data/web-pc-tab.png)

Smooth multi-tab experience — no more being limited to a single session per page. Open multiple tabs to work on different tasks simultaneously.

**Mobile Access**: Append `/m` to the URL (e.g., `http://127.0.0.1:8009/m`) to access the mobile-optimized interface.

**H5 Mobile Interface**:
![H5 Mobile Interface](doc_data/web-h5.png)

For external access, refer to the ngrok configuration below.

## Configuration

### Configuration File Location
Default path: `~/.agent_win_serve/config.json`
Can be specified via environment variable `SERVE_CONFIG`.

### Configuration Method
Configuration file is automatically created when first saving configuration through web interface, no manual operation required. After starting, access the page and configure in the settings interface.

### Main Configuration Fields
| Field | Description |
|---|---|
| claude_bin | Path to claude executable, empty by default, automatically searches for local claude during initialization, if not found uses `C:/Users/{Your user}/.local/bin/claude.exe` (username is current system user) |
| access_token | Access token |
| project_dirs | Working directory candidates, separated by `;` |
| models | Third-party model configuration array |

**Notes**:
- `host` and `port` fields are optional, defaults are `0.0.0.0` and `8009` respectively. Multiple access modes (local, LAN, external) are displayed at startup
- Supports `claude login` local login method, no API Key required

### Multi-Model Configuration Example
```json
{
  "models": [
    {
      "id": "1",
      "name": "Official Claude (local login)",
      "base_url": "",
      "auth_token": "",
      "model": ""
    },
    {
      "id": "2",
      "name": "Kimi K2",
      "base_url": "https://api.moonshot.cn/anthropic",
      "auth_token": "sk-your-key",
      "model": "kimi-k2-0905-preview"
    }
  ]
}
```

**Notes**:
- `id` field is auto-increment number for model configuration identification
- Built-in model (Official Claude) uses local login method, no API Key required
- Third-party models need corresponding `auth_token`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| SERVE_CONFIG | ~/.agent_win_serve/config.json | Configuration file path |
| CLAUDE_BIN | (empty) | Path to claude executable, empty by default, automatically searches for local claude, if not found uses `C:/Users/{Your user}/.local/bin/claude.exe` |
| PROJECT_DIRS | (empty) | Working directory candidates |
| ACCESS_TOKEN | (empty) | Access token |

**Notes**:
- `SERVE_HOST` and `SERVE_PORT` environment variables are optional, defaults are `0.0.0.0` and `8009` respectively
- Supports `claude login` local login method, no API Key required

## External Access

Use ngrok to expose local service to external network:

```bash
# Install ngrok (if not installed)
# Windows: download from https://ngrok.com/download or use scoop install ngrok

# After starting service, run in another terminal
ngrok http 8009
```

ngrok will assign a public address (e.g., `https://xxxx.ngrok-free.app`), through which you can access the service externally.

**Note**: When accessing externally, the access token (access_token) remains valid, ensuring service security.

## Project Structure

```
claude-tape-web/
├── static/             # Frontend static files
│   ├── index.html      # Main page
│   ├── terminal.js     # Terminal logic
│   └── vendor/         # Third-party libraries (xterm.js)
├── pty/                # PTY implementation (Windows/POSIX)
├── app.py              # FastAPI application
├── commands.py         # Command loading
├── commands.json       # Command configuration
├── config.py           # Configuration management
├── env_builder.py      # Environment variable builder
├── pty_manager.py      # PTY session management
├── session_store.py    # Session storage
├── spawn.py            # PTY spawn parameter builder
├── term_ws.py          # WebSocket terminal
├── token_store.py      # Token management
├── __main__.py         # Entry point
├── config.example.json # Configuration example
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| / | GET | Main page |
| /ws/term | WebSocket | Terminal connection |
| /api/commands | GET | Get command list |
| /api/project-dirs | GET | Get working directories |
| /api/models | GET | Get model list |
| /api/sessions | GET | Get session list |
| /api/sessions/{sid} | PATCH | Update session |
| /api/sessions/{sid} | DELETE | Delete session |
| /api/config | GET | Get configuration |
| /api/config | PUT | Save configuration |
| /api/config/apply | POST | Apply configuration |

All API endpoints require `token` query parameter for authentication.

<br/>

## Star History

<a href="https://www.star-history.com/#dongyongwei/claude-tape-web&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=dongyongwei/claude-tape-web&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=dongyongwei/claude-tape-web&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=dongyongwei/claude-tape-web&type=Date" />
 </picture>
</a>

<br/>

---

<p align="center">
  <sub>MIT License — see <a href="./LICENSE">LICENSE</a></sub>
</p>