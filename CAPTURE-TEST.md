# CAPTURE-TEST — 8x assignment

## Tool and model (step 1)

- **Tool:** Cursor
- **Model:** Composer (Auto) — same model plans and executes in the agent session (hook payload currently reports `model: default`)
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
| 1 | `9191017f-3e0e-47e5-9586-fe6bed398282` | `.agent-logs/2026-09-25_13-54-23_9191017f-3e0e-47e5-9586-fe6bed398282.md` |
| 2 | `c271ae98-57b3-495d-addc-859a137e4430` | `.agent-logs/2026-09-25_13-55-15_c271ae98-57b3-495d-addc-859a137e4430.md` |

Both sessions produced separate log files, so the hook is installed at the project level (not only in the session that created it).

## Canary 1 — raw (from log)

````
[LOG_ENTRY type=PROMPT num=1 session=9191017f]
timestamp: 2026-09-25T13:54:49.614Z
model: default

CAPTURE TEST — 8x assignment, CinderTL


[LOG_ENTRY type=RESPONSE num=1 session=9191017f]
timestamp: 2026-09-25T13:55:09.552Z
model: default

**Canary 1 — prompt captured.**

Log: `.agent-logs/2026-09-25_13-54-23_9191017f-3e0e-47e5-9586-fe6bed398282.md`

```
[LOG_ENTRY type=PROMPT num=1 session=9191017f]
timestamp: 2026-09-25T13:54:49.614Z
model: default

CAPTURE TEST — 8x assignment, CinderTL
```

This reply is the RESPONSE; `afterAgentResponse` should append it when the turn ends.

**Next:** open a **new** Agent chat in this repo and send:

```text
CAPTURE TEST — 8x assignment, CinderTL
```

Then come back here (or say “canary 2 done”) so I can confirm the second session log and write `CAPTURE-TEST.md`. Do not start the assignment yet.

---
git commit message: confirm canary 1 agent-capture prompt landed in session log
````

## Canary 2 — raw (from log)

````
[LOG_ENTRY type=PROMPT num=1 session=c271ae98]
timestamp: 2026-09-25T13:55:17.535Z
model: default

CAPTURE TEST — 8x assignment, CinderTL


[LOG_ENTRY type=RESPONSE num=1 session=c271ae98]
timestamp: 2026-09-25T13:55:35.732Z
model: default

**Canary 2 — prompt captured.**

Log: `.agent-logs/2026-09-25_13-55-15_c271ae98-57b3-495d-addc-859a137e4430.md`

```
[LOG_ENTRY type=PROMPT num=1 session=c271ae98]
timestamp: 2026-09-25T13:55:17.535Z
model: default

CAPTURE TEST — 8x assignment, CinderTL
```

Separate session from canary 1 (`9191017f` → this `c271ae98`), so project-level hooks are working. Author resolves as `CinderTL`. This reply is the RESPONSE; `afterAgentResponse` should append it when the turn ends.

Capture is verified. You can go back to the other chat and say “canary 2 done”, or start the assignment here.

git commit message: confirm canary 2 agent-capture in a new session log
````

## What did not work first

1. **Missing hooks after clone:** `.gitignore` had `.cursor/`, so `.cursor/hooks.json` and `agent-capture.py` never shipped with the repo. Historical `.agent-logs/` existed, but new sessions wrote nothing until hooks were restored.
2. **First setup turn:** The message that installed the hooks was submitted *before* the hooks existed, so that turn’s prompt was not auto-captured (expected). `afterAgentResponse` did fire afterward and left an orphan RESPONSE at the top of canary 1’s log — left as-is.
3. **Dry-run cleanup:** Temporary dry-run log files under `.agent-logs/` were removed so only real canary sessions remain (plus prior committed session logs).
4. **Gitignore fix:** Changed to ignore `.cursor/*` but un-ignore `.cursor/hooks.json` and `.cursor/hooks/**` so capture config can be committed.
