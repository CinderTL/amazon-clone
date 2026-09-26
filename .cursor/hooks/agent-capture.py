#!/usr/bin/env python3
"""Cursor project hook: capture prompt + final response into .agent-logs/."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(os.environ.get("CURSOR_PROJECT_DIR") or Path.cwd()).resolve()
LOG_DIR = ROOT / ".agent-logs"
STATE_DIR = LOG_DIR / ".state"
TOOL_NAME = "cursor"
PROJECT_NAME = ROOT.name


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_iso(dt: datetime | None = None) -> str:
    return (dt or utc_now()).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def file_stamp(dt: datetime | None = None) -> str:
    return (dt or utc_now()).strftime("%Y-%m-%d_%H-%M-%S")


def detect_author() -> str:
    env = os.environ.get("AGENT_CAPTURE_AUTHOR", "").strip()
    if env:
        return env
    try:
        url = subprocess.check_output(
            ["git", "-C", str(ROOT), "remote", "get-url", "origin"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        m = re.search(r"github\.com[:/]([^/]+)/", url)
        if m:
            return m.group(1)
    except Exception:
        pass
    try:
        name = subprocess.check_output(
            ["git", "-C", str(ROOT), "config", "user.name"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        if name:
            return name
    except Exception:
        pass
    return "unknown"


def read_payload() -> dict:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"_raw": raw}


def emit(obj: dict | None = None) -> None:
    sys.stdout.write(json.dumps(obj if obj is not None else {}))
    sys.stdout.flush()


def session_id_of(payload: dict) -> str:
    return (
        payload.get("session_id")
        or payload.get("conversation_id")
        or os.environ.get("AGENT_CAPTURE_SESSION_ID")
        or "unknown-session"
    )


def model_of(payload: dict) -> str:
    return (
        payload.get("model_id")
        or payload.get("model")
        or os.environ.get("AGENT_CAPTURE_MODEL")
        or "unknown"
    )


def short_id(session_id: str) -> str:
    return session_id.split("-")[0] if session_id else "unknown"


def state_path(session_id: str) -> Path:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    return STATE_DIR / f"{session_id}.json"


def load_state(session_id: str) -> dict:
    path = state_path(session_id)
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def save_state(session_id: str, state: dict) -> None:
    path = state_path(session_id)
    path.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


def find_log_for_session(session_id: str) -> Path | None:
    state = load_state(session_id)
    if state.get("log_path"):
        p = Path(state["log_path"])
        if p.exists():
            return p
    if not LOG_DIR.exists():
        return None
    matches = sorted(LOG_DIR.glob(f"*_{session_id}.md"))
    return matches[-1] if matches else None


def write_frontmatter(
    path: Path,
    *,
    session_id: str,
    author: str,
    model: str,
    total_exchanges: int,
    first_prompt_time: str | None,
    last_prompt_time: str | None,
    date_str: str,
) -> None:
    body_start = "# Session Log"
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    if text.startswith("---"):
        parts = text.split("---", 2)
        body = parts[2].lstrip("\n") if len(parts) >= 3 else ""
    else:
        body = text

    if not body.strip().startswith(body_start):
        header = (
            f"# Session Log - {date_str}\n\n"
            f"Session: `{short_id(session_id)}` | Project: `{PROJECT_NAME}` | Author: `{author}`\n\n"
            f"---\n\n"
        )
        body = header + body

    fm = (
        "---\n"
        f"session_id: {session_id}\n"
        f"date: {date_str}\n"
        f"author: {author}\n"
        f"model: {model}\n"
        f"tool: {TOOL_NAME}\n"
        f"project: {PROJECT_NAME}\n"
        f"total_exchanges: {total_exchanges}\n"
        f"first_prompt_time: {first_prompt_time or ''}\n"
        f"last_prompt_time: {last_prompt_time or ''}\n"
        "---\n\n"
    )
    path.write_text(fm + body, encoding="utf-8")


def ensure_log(session_id: str, model: str) -> Path:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    existing = find_log_for_session(session_id)
    if existing:
        return existing

    now = utc_now()
    path = LOG_DIR / f"{file_stamp(now)}_{session_id}.md"
    author = detect_author()
    date_str = now.strftime("%Y-%m-%d")
    write_frontmatter(
        path,
        session_id=session_id,
        author=author,
        model=model,
        total_exchanges=0,
        first_prompt_time=None,
        last_prompt_time=None,
        date_str=date_str,
    )
    save_state(
        session_id,
        {
            "log_path": str(path),
            "author": author,
            "model": model,
            "total_exchanges": 0,
            "prompt_count": 0,
            "response_count": 0,
            "first_prompt_time": None,
            "last_prompt_time": None,
            "date": date_str,
        },
    )
    return path


def append_entry(path: Path, entry: str) -> None:
    with path.open("a", encoding="utf-8") as f:
        f.write(entry)


def refresh_frontmatter(session_id: str, model: str | None = None) -> None:
    state = load_state(session_id)
    path = find_log_for_session(session_id)
    if not path:
        return
    write_frontmatter(
        path,
        session_id=session_id,
        author=state.get("author") or detect_author(),
        model=model or state.get("model") or "unknown",
        total_exchanges=int(state.get("total_exchanges") or 0),
        first_prompt_time=state.get("first_prompt_time"),
        last_prompt_time=state.get("last_prompt_time"),
        date_str=state.get("date") or utc_now().strftime("%Y-%m-%d"),
    )


def handle_session_start(payload: dict) -> dict:
    session_id = session_id_of(payload)
    model = model_of(payload)
    path = ensure_log(session_id, model)
    return {
        "env": {
            "AGENT_CAPTURE_SESSION_ID": session_id,
            "AGENT_CAPTURE_LOG": str(path),
            "AGENT_CAPTURE_MODEL": model,
        }
    }


def handle_prompt(payload: dict) -> dict:
    session_id = session_id_of(payload)
    model = model_of(payload)
    prompt = payload.get("prompt")
    if prompt is None:
        prompt = ""
    path = ensure_log(session_id, model)
    state = load_state(session_id)
    num = int(state.get("prompt_count") or 0) + 1
    ts = utc_iso()
    entry = (
        f"[LOG_ENTRY type=PROMPT num={num} session={short_id(session_id)}]\n"
        f"timestamp: {ts}\n"
        f"model: {model}\n\n"
        f"{prompt}\n\n"
    )
    append_entry(path, entry)
    state["prompt_count"] = num
    state["total_exchanges"] = num
    state["model"] = model
    state["last_prompt_time"] = ts
    if not state.get("first_prompt_time"):
        state["first_prompt_time"] = ts
    state["log_path"] = str(path)
    save_state(session_id, state)
    refresh_frontmatter(session_id, model)
    return {"continue": True}


def handle_response(payload: dict) -> dict:
    session_id = session_id_of(payload)
    model = model_of(payload)
    text = payload.get("text")
    if text is None:
        text = ""
    path = ensure_log(session_id, model)
    state = load_state(session_id)
    # Pair response with latest prompt number when possible
    num = int(state.get("response_count") or 0) + 1
    prompt_count = int(state.get("prompt_count") or 0)
    if prompt_count > 0:
        num = prompt_count
    ts = utc_iso()
    entry = (
        f"[LOG_ENTRY type=RESPONSE num={num} session={short_id(session_id)}]\n"
        f"timestamp: {ts}\n"
        f"model: {model}\n\n"
        f"{text}\n\n"
    )
    append_entry(path, entry)
    state["response_count"] = max(int(state.get("response_count") or 0), num)
    state["model"] = model
    state["log_path"] = str(path)
    save_state(session_id, state)
    refresh_frontmatter(session_id, model)
    return {}


def handle_stop(payload: dict) -> dict:
    session_id = session_id_of(payload)
    model = model_of(payload)
    if find_log_for_session(session_id):
        refresh_frontmatter(session_id, model)
    return {}


def main() -> int:
    payload = read_payload()
    event = (
        payload.get("hook_event_name")
        or os.environ.get("CURSOR_HOOK_EVENT_NAME")
        or ""
    ).strip()

    try:
        if event == "sessionStart":
            emit(handle_session_start(payload))
        elif event == "beforeSubmitPrompt":
            emit(handle_prompt(payload))
        elif event == "afterAgentResponse":
            emit(handle_response(payload))
        elif event == "stop":
            emit(handle_stop(payload))
        else:
            # Unknown / missing event: fail open, do not block the agent.
            emit({"continue": True} if "prompt" in payload else {})
    except Exception as exc:
        # Fail open so capture bugs never block the agent.
        sys.stderr.write(f"agent-capture error: {exc}\n")
        emit({"continue": True})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
