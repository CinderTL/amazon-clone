# CAPTURE-TEST — 8x assignment

## Tool and model (step 1)

- **Tool:** Cursor
- **Model:** Composer (Auto) — same model plans and executes in the agent session
- **Automatic capture:** Yes — Cursor project hooks

## Mechanism and config

- **Config:** `.cursor/hooks.json`
- **Script:** `.cursor/hooks/agent-capture.py`
- **Events:** `sessionStart`, `beforeSubmitPrompt`, `afterAgentResponse`, `stop`
- **Output:** `.agent-logs/` (one markdown file per conversation; prompt + final response only)

Invoked as `python3 .cursor/hooks/agent-capture.py` (not as a bare executable).

## Log files the canaries landed in

| Canary | Session | Log path |
|--------|---------|----------|
| 1 | `5c9b42e4-16cc-4a1d-933e-0dbce8b3c2db` | `.agent-logs/2026-09-24_08-40-50_5c9b42e4-16cc-4a1d-933e-0dbce8b3c2db.md` |
| 2 | `b21e7d3b-35f8-4c30-93da-45ad17273078` | `.agent-logs/2026-09-24_08-43-32_b21e7d3b-35f8-4c30-93da-45ad17273078.md` |

Both sessions produced separate log files, so the hook is installed at the project level (not only in the session that created it).

## Canary 1 — raw (from log)

````
[LOG_ENTRY type=PROMPT num=1 session=5c9b42e4]
timestamp: 2026-09-24T08:42:41.004Z
model: composer

CAPTURE TEST — 8x assignment, CinderTL


[LOG_ENTRY type=RESPONSE num=1 session=5c9b42e4]
timestamp: 2026-09-24T08:43:10.353Z
model: composer

**Canary 1 — prompt captured.**

Log file: `.agent-logs/2026-09-24_08-40-50_5c9b42e4-16cc-4a1d-933e-0dbce8b3c2db.md`

The PROMPT entry is there. This reply is the RESPONSE; `afterAgentResponse` should append it when the turn ends.

**Next:** open a **new** Agent chat in this repo and send again:

```text
CAPTURE TEST — 8x assignment, CinderTL
```

Then come back here (or say “canary 2 done”) so I can confirm the second session log and write `CAPTURE-TEST.md`. Do not start the assignment yet.
````

## Canary 2 — raw (from log)

Prompt captured in the second session (below). The RESPONSE for this turn is appended to the same file by `afterAgentResponse` when the turn ends (confirmation that wrote this file).

````
[LOG_ENTRY type=PROMPT num=1 session=b21e7d3b]
timestamp: 2026-09-24T08:43:36.697Z
model: composer

CAPTURE TEST — 8x assignment, CinderTL
````

## What did not work first

1. **Executable bit / shebang:** Initial `.cursor/hooks.json` used `.cursor/hooks/agent-capture.py` directly. Sandbox/`chmod +x` failed; switched commands to `python3 .cursor/hooks/agent-capture.py`.
2. **First setup turn:** The assignment paste that installed the hooks was submitted *before* the hooks existed, so that turn was not auto-captured (expected). Canaries after install are what prove capture.
3. **Dry-run cleanup:** Temporary dry-run log files under `.agent-logs/` were removed so only real canary sessions remain.
