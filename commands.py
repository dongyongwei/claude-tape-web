import json
from pathlib import Path

# commands.json at the repo root
_DEFAULT_COMMANDS_FILE = Path(__file__).parent / "commands.json"


def load_commands(claude_bin: str, commands_file: Path | None = None):
    """Return (argv_map, ui_list).

    - argv_map: {id: [argv...]} with ${CLAUDE_BIN} substituted, used by spawn.
    - ui_list: [{id,name,color,group}] for the frontend command selector.
    """
    path = commands_file or _DEFAULT_COMMANDS_FILE
    if not path.exists():
        return {}, []
    raw = json.loads(path.read_text(encoding="utf-8"))
    argv_map: dict[str, list[str]] = {}
    ui_list: list[dict] = []
    for entry in raw:
        cmd_template = entry.get("command", "${CLAUDE_BIN}")
        argv = cmd_template.replace("${CLAUDE_BIN}", claude_bin).split()
        argv_map[entry["id"]] = argv
        ui_list.append({
            "id": entry["id"],
            "name": entry.get("name", entry["id"]),
            "color": entry.get("color", "#888"),
            "group": entry.get("group", ""),
        })
    return argv_map, ui_list
