HANDOFF.md

Read this file FIRST. Hot session state. Everything else is reference.

Task

Objective: Build Telegram bot gateway — the product's front door
Phase / Task: Phase 4 / Task 4.4a: Hardening pass
Status: COMPLETE — cross-AI audit fixes applied

Progress
Task 4.4a complete. All 8 hardening subtasks done:
- 4.4a-1: Webhook authentication — `X-Telegram-Bot-Api-Secret-Token` header check, 401 on mismatch, fail-fast at startup
- 4.4a-2: Path traversal guard — `safePath()` helper on ObsidianService blocks vault escapes in `createNote`/`readNote`
- 4.4a-3: Timezone fix — `buildDate()` uses local time (`getFullYear`/`getMonth`/`getDate`) instead of UTC `toISOString`
- 4.4a-4: Startup config validation — fail-fast guards for `TRELLO_API_KEY`, `TRELLO_TOKEN`, `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`. Removed `!` non-null assertions. Removed dead runtime check in `sendReply`.
- 4.4a-5: `request()` non-JSON handling — `response.json()` wrapped in try/catch, returns `PARSE_ERROR` Result
- 4.4a-6: Config read error handling — `readFileSync` moved inside try/catch for Result contract
- 4.4a-7: Due-date contract — `SYSTEM_PROMPT` → `buildSystemPrompt()` function, injects today's local date, instructs Haiku to return YYYY-MM-DD format
- 4.4a-8: Zod schema — `LabelSchema.color` now `.nullable()` for colorless Trello labels

Cross-AI audit fixes (this session):
- Path traversal `startsWith` prefix collision fixed — now checks `vaultPath + path.sep` to prevent `/vault-evil` bypassing `/vault` guard
- `handleMessage` now checks Results from `createCard` and `appendToDaily` before replying — no more lying to user on silent failure
- Remaining hardening items (#3-7) deferred to Task 6.0 in task-plan.md

Decisions Made
- Token stored in `.env` (not `~/.ctx/config.json`) — matches existing Trello credential pattern
- Telegram is the gateway/entry point, not a service like Trello/Obsidian — different architectural role
- Express for HTTP server (POST `/webhook` route)
- ngrok for local webhook testing (temporary public URL tunneling to localhost)
- Claude Haiku (`claude-haiku-4-5-20251001`) for parsing — cheapest model, sufficient for classification
- No `event` type in parser — calendar was descoped, no point parsing what can't be routed
- Parser is a plain function, not a class — only one method, no constructor params needed
- `stripCodeBlock()` helper strips markdown code fences from Claude response before JSON.parse
- `dueDate` schema uses `.nullable().optional()` — Claude sometimes returns null instead of omitting
- `sendReply()` returns `Promise<void>` not `Result<void>` — fire-and-forget, nobody can act on a failed reply
- `import 'dotenv/config'` must be first import — modules that read `process.env` at load time need env populated first
- Webhook secret registered with Telegram via `setWebhook?secret_token=...` — Telegram now sends the header
- `safePath` is a private class method, not a standalone function — only used internally by ObsidianService
- `buildDate` as private method (could be standalone, but works as-is)

Files in Play
- `src/gateway/server.ts` — Webhook auth guard, startup env validation, handleMessage routing, Result-checked writes
- `src/gateway/parser.ts` — `buildSystemPrompt()` with dynamic date, YYYY-MM-DD due date format
- `src/services/obsidian-service.ts` — `safePath()` guard with `path.sep` fix, `buildDate()` local timezone helper
- `src/services/config-service.ts` — `readFileSync` inside try/catch
- `src/utils/request.ts` — `response.json()` try/catch for non-JSON responses
- `src/types/trello.ts` — `LabelSchema.color` nullable
- `~/.ctx/config.json` — Has `trello.defaultInboxListId` and `obsidian.defaultVaultPath`
- `task-plan.md` — Task 6.0 added for deferred hardening items

What's Next
Phase 4A: The Agent Loop. Replace classifier→switch dispatch with tool-calling loop. Start with Task 4A.1 (define tool schemas). See task-plan.md for full breakdown.

Known Issues
1. `buildDate()` duplicated in obsidian-service and parser — could extract to shared utility later

Blockers
None.

Failed Approaches
- First attempt at `sendReply`: used shared `request()` utility with Zod schema for Telegram response — over-engineered. Simplified to plain `fetch` with `response.ok` check.
- Import order: `dotenv/config` was imported after parser — Anthropic client created with undefined API key, all parsing silently failed.

This Week's Pattern
Cross-AI audit — ran codebase through both Claude and ChatGPT, compared findings, triaged into fix-now vs defer. The `startsWith` prefix collision was the best catch (real security bug both AIs identified independently). The Result-checking fix closes the "silent failure" gap from last session's known issues.

Last Session

Date: 2026-02-14
Duration: ~30 minutes
Mode: Mixed — Teach (path traversal fix), Delegate (server.ts Result checks, task-plan update)
Kill? clean

Agent Reading Protocol

Read this file first
Read CLAUDE.md second
State in ONE sentence where we are
Wait for confirm
Begin

Do not summarize this file. Do not ask "what would you like to work on?" if What's Next has content.
