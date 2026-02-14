HANDOFF.md

Read this file FIRST. Hot session state. Everything else is reference.

Task

Objective: Build Telegram bot gateway — the product's front door
Phase / Task: Phase 4 / Task 4.4a: Hardening pass
Status: not started

Progress
Task 4.4 complete. Full end-to-end flow working: Telegram message → Claude Haiku parses → routes to TrelloService (task) or ObsidianService (note) → bot replies with confirmation. Live tested with ngrok tunnel.

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

Files in Play
- `src/gateway/server.ts` — Complete gateway: Express server, webhook handler, `sendReply()`, `handleMessage()` with Result-based routing, service initialization with fail-fast guards.
- `src/gateway/parser.ts` — `parseMessage()` function. Calls Claude Haiku, validates with Zod, returns `Result<ParsedMessage>`.
- `src/utils/request.ts` — Shared `request()` utility extracted from TrelloService.
- `src/services/trello-service.ts` — Uses shared `request()` import.
- `~/.ctx/config.json` — Has `trello.defaultInboxListId` and `obsidian.defaultVaultPath`.

What's Next
Task 4.4a: Hardening pass. 8 subtasks addressing security, correctness, and robustness. See task-plan.md for full list. Start with 4.4a-1 (webhook authentication) or 4.4a-4 (startup config validation) — both are quick wins.

Known Issues
1. Due date format mismatch — parser returns "thursday", Trello expects ISO date string. (4.4a-7)
2. `createCard` Result not checked in `handleMessage` — card creation can fail silently while bot replies "success". (Task 4.5)
3. `trellodefaultlist!` non-null assertion — works but is a code smell. Module-level narrowing doesn't carry into functions.

Blockers
None.

Failed Approaches
- First attempt at `sendReply`: used shared `request()` utility with Zod schema for Telegram response — over-engineered. Simplified to plain `fetch` with `response.ok` check.
- Import order: `dotenv/config` was imported after parser — Anthropic client created with undefined API key, all parsing silently failed.

This Week's Pattern
Silent failures — import order bug produced no error message, just empty credentials. Unchecked Result values let Trello failures pass as successes. Visibility and error checking are recurring themes.

Last Session

Date: 2026-02-14
Duration: ~2 hours
Mode: Coach (70%) / Teach (30% — import order, module narrowing, nullish coalescing)
Kill? clean

Agent Reading Protocol

Read this file first
Read CLAUDE.md second
State in ONE sentence where we are
Wait for confirm
Begin

Do not summarize this file. Do not ask "what would you like to work on?" if What's Next has content.
