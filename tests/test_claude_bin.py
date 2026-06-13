"""resolve_claude_bin: turn a portable config value into THIS machine's absolute path."""
import os
from pathlib import Path

import pytest

import config
from config import resolve_claude_bin


@pytest.fixture(autouse=True)
def _no_registry(monkeypatch):
    """Default: pretend the registry PATH is empty so probing falls through to the
    well-known-dir / give-up branches. Tests that exercise the registry step opt back in."""
    monkeypatch.setattr(config, "_registry_path_dirs", lambda: "")


def test_absolute_existing_used_as_is(tmp_path):
    exe = tmp_path / "claude.exe"
    exe.write_text("")
    assert resolve_claude_bin(str(exe), env={}) == str(exe)


def test_falls_back_to_path_lookup(tmp_path, monkeypatch):
    # shutil.which honours the PATH we pass in via env.
    bindir = tmp_path / "bin"
    bindir.mkdir()
    exe = bindir / ("claude.exe" if os.name == "nt" else "claude")
    exe.write_text("")
    if os.name != "nt":
        exe.chmod(0o755)
    env = {"PATH": str(bindir)}
    # shutil.which reads PATHEXT from the real os.environ and echoes its casing
    # (e.g. ".EXE"); compare via normcase so the test is case-insensitive on Windows.
    got = resolve_claude_bin("claude", env=env)
    assert os.path.normcase(got) == os.path.normcase(str(exe))


def test_stale_absolute_from_other_machine_reresolves(tmp_path, monkeypatch):
    # config carries an absolute path that does not exist here -> probe ~/.local/bin
    fake_home = tmp_path / "home"
    real = fake_home / ".local" / "bin" / "claude.exe"
    real.parent.mkdir(parents=True)
    real.write_text("")
    monkeypatch.setattr(Path, "home", classmethod(lambda cls: fake_home))
    stale = r"C:\Other\Machine\claude.exe"
    assert resolve_claude_bin(stale, env={"PATH": ""}) == str(real)


def test_probes_local_bin_when_path_incomplete(tmp_path, monkeypatch):
    # packaged exe launched without the user's PATH -> still found in ~/.local/bin
    fake_home = tmp_path / "home"
    real = fake_home / ".local" / "bin" / "claude.exe"
    real.parent.mkdir(parents=True)
    real.write_text("")
    monkeypatch.setattr(Path, "home", classmethod(lambda cls: fake_home))
    assert resolve_claude_bin("claude", env={"PATH": ""}) == str(real)


def test_resolves_via_registry_path_when_process_path_stale(tmp_path, monkeypatch):
    # process PATH lacks claude (stale after install); registry PATH has the dir.
    bindir = tmp_path / "bin"
    bindir.mkdir()
    exe = bindir / ("claude.exe" if os.name == "nt" else "claude")
    exe.write_text("")
    if os.name != "nt":
        exe.chmod(0o755)
    monkeypatch.setattr(config, "_registry_path_dirs", lambda: str(bindir))
    if os.name == "nt":
        got = resolve_claude_bin("claude", env={"PATH": ""})
        assert os.path.normcase(got) == os.path.normcase(str(exe))
    else:
        # shutil.which needs PATHEXT semantics only on Windows; posix just matches the name
        assert resolve_claude_bin("claude", env={"PATH": ""}) == str(exe)


def test_gives_up_returns_original_when_nothing_found(tmp_path, monkeypatch):
    monkeypatch.setattr(Path, "home", classmethod(lambda cls: tmp_path / "nohome"))
    assert resolve_claude_bin("claude", env={"PATH": ""}) == "claude"
