HANDOFF.md

Read this file FIRST. Hot session state. Everything else is reference.

Task

Objective: Build Telegram bot gateway — the product's front door
Phase / Task: Phase 4 / Task 4.4: Wire it together
Status: not started

Progress
Task 4.3 complete. `parseMessage()` in `src/gateway/parser.ts` calls Claude Haiku API to classify informal text as task/note/unknown, extracts structured content and due dates. Zod validates LLM responses. Tested with multiple inputs via CLI `parser test` command.

Decisions Made
- Token stored in `.env` (not `~/.ctx/config.json`) — matches existing Trello credential pattern
- Telegram is the gateway/entry point, not a service like Trello/Obsidian — different architectural role
- Express for HTTP server (POST `/webhook` route)
- ngrok for local webhook testing (temporary public URL tunneling to localhost)
- Claude Haiku (`claude-haiku-4-5-20251001`) for parsing — cheapest model, sufficient for classification
- No `event` type in parser — calendar was descoped, no point parsing what can't be routed
- No `project` field in parser — no board routing logic exists yet
- Parser is a plain function, not a class — only one method, no constructor params needed
- `stripCodeBlock()` helper strips markdown code fences from Claude response before JSON.parse
- `dueDate` schema uses `.nullable().optional()` — Claude sometimes returns null instead of omitting

Files in Play
- `src/gateway/parser.ts` — `parseMessage()` function. Calls Claude Haiku, validates with Zod, returns `Result<ParsedMessage>`. Logs token usage.
- `src/gateway/server.ts` — Express server with POST `/webhook` route. Receives Telegram updates.
- `src/index.ts` — parser test command added (throwaway), telegram test/update-test commands (throwaway)
- `.env` — ANTHROPIC_API_KEY added

What's Next
Start Task 4.4: Wire it together — connect gateway server → parser → TrelloService/ObsidianService → Telegram reply. When someone texts the bot, the message gets parsed and routed to the right service.

Blockers
None.

Failed Approaches
- First test: Claude returned JSON wrapped in markdown code blocks — `JSON.parse()` failed. Fixed with `stripCodeBlock()` helper.
- Second test: Claude returned `"dueDate": null` — Zod schema only had `.optional()` (allows undefined, not null). Fixed by adding `.nullable()`.

This Week's Pattern
None yet — track one repeated process skip or mistake per week, then add a guardrail to prevent it.

Last Session

Date: 2026-02-12
Duration: ~45 min
Mode: Coach (70%) / Teach (30% — SDK, prompt engineering, z.enum new)
Kill? clean

Agent Reading Protocol

Read this file first
Read CLAUDE.md second
State in ONE sentence where we are
Wait for confirm
Begin

Do not summarize this file. Do not ask "what would you like to work on?" if What's Next has content.
