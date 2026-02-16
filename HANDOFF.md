HANDOFF.md

Read this file FIRST. Hot session state. Everything else is reference.

Task

Objective: Build Telegram bot gateway — the product's front door
Phase / Task: Phase 4A / Task 4A.1: Define tool schemas
Status: COMPLETE

Progress
Task 4A.1 complete. Created `src/agent/tools.ts` with:
- 10 Zod input schemas for agent tools (CreateTaskInput, GetBoardsInput, GetListsInput, GetCardsInput, MoveCardInput, ArchiveCardInput, SetDueDateInput, AppendNoteInput, SearchNotesInput, ReadDailyInput)
- 10 Anthropic tool definitions with name, description, and input_schema
- Uses Zod v4 native `z.toJSONSchema()` — no extra library needed
- Added `get_boards` and `get_lists` beyond original 8 (agent needs board/list discovery to sort inbox)

Also this session:
- Configured checkpoint gate hook in `.claude/settings.json` — prompt-type PreToolUse hook on Edit|Write that checks if Claude stated a plan before editing

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
- 10 tools (not original 8) — added `get_boards` and `get_lists` for board/list discovery
- `create_task.list_id` is optional — defaults to configured inbox, executor injects from config
- Snake_case field names in tool schemas — clearer for LLM than Trello's `idList` convention
- Zod v4 native `z.toJSONSchema()` over `zod-to-json-schema` library — v4 has it built in, library only supports v3
- Hand-wrote tool descriptions focused on "when to use" not just "what it does"

Files in Play
- `src/agent/tools.ts` — 10 Zod input schemas + Anthropic tool definitions array
- `src/gateway/server.ts` — Webhook auth guard, startup env validation, handleMessage routing, Result-checked writes
- `src/gateway/parser.ts` — `buildSystemPrompt()` with dynamic date, YYYY-MM-DD due date format
- `src/services/obsidian-service.ts` — `safePath()` guard with `path.sep` fix, `buildDate()` local timezone helper
- `src/services/config-service.ts` — `readFileSync` inside try/catch
- `src/utils/request.ts` — `response.json()` try/catch for non-JSON responses
- `src/types/trello.ts` — `LabelSchema.color` nullable
- `~/.ctx/config.json` — Has `trello.defaultInboxListId` and `obsidian.defaultVaultPath`
- `.claude/settings.json` — Hooks: protect-files, block-secret-leaks, checkpoint gate, session-end, pre-compact, inject-context
- `task-plan.md` — Task 6.0 added for deferred hardening items

What's Next
Task 4A.2: Build the agent loop + Task 4A.3: Wire the executor. These can be built together — the loop calls the executor. See task-plan.md for full breakdown.

Known Issues
1. `buildDate()` duplicated in obsidian-service and parser — could extract to shared utility later

Blockers
None.

Failed Approaches
- First attempt at `sendReply`: used shared `request()` utility with Zod schema for Telegram response — over-engineered. Simplified to plain `fetch` with `response.ok` check.
- Import order: `dotenv/config` was imported after parser — Anthropic client created with undefined API key, all parsing silently failed.
- `zod-to-json-schema` library — incompatible with Zod v4. Switched to native `z.toJSONSchema()`.

This Week's Pattern
Tool schema design — thinking from the LLM's perspective. Field names, descriptions, and optional vs required all affect how well the agent picks the right tool. Input schemas are separate from output schemas (different direction, different shape).

Last Session

Date: 2026-02-15
Duration: ~45 minutes
Mode: Coach (tool schema design), Teach (zod-to-json-schema → z.toJSONSchema), Delegate (tool descriptions + hook setup)
Kill? clean

Agent Reading Protocol

Read this file first
Read CLAUDE.md second
State in ONE sentence where we are
Wait for confirm
Begin

Do not summarize this file. Do not ask "what would you like to work on?" if What's Next has content.
