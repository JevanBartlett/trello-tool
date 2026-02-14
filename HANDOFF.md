HANDOFF.md

Read this file FIRST. Hot session state. Everything else is reference.

Task

Objective: Build Telegram bot gateway — the product's front door
Phase / Task: Phase 4 / Task 4.4: Wire it together
Status: in progress (steps 1-2 of 5 complete)

Progress
Task 4.4 started. Steps completed: (1) expanded `TelegramUpdate` interface with `chat.id: number`, (2) added `sendReply()` function — plain fetch POST to Telegram `sendMessage` API, fire-and-forget with `console.error` logging. Also extracted shared `request()` utility from TrelloService into `src/utils/request.ts`.

Steps remaining: (3) `handleMessage()` function — parse → route → call service → reply, (4) wire webhook handler to call `handleMessage`, (5) initialize TrelloService/ObsidianService/ConfigService in server.ts.

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
- `sendReply()` returns `Promise<void>` not `Result<void>` — fire-and-forget, nobody can act on a failed reply
- No Zod validation on Telegram `sendMessage` response — we don't use the response data, just check `response.ok`

Files in Play
- `src/gateway/server.ts` — Express server with POST `/webhook` route, `sendReply()` function. Next: add `handleMessage()`, initialize services.
- `src/gateway/parser.ts` — `parseMessage()` function. Calls Claude Haiku, validates with Zod, returns `Result<ParsedMessage>`.
- `src/utils/request.ts` — NEW. Shared `request()` utility extracted from TrelloService.
- `src/services/trello-service.ts` — Updated to use shared `request()` import.
- `src/index.ts` — parser test command added (throwaway), telegram test/update-test commands (throwaway)
- `.env` — ANTHROPIC_API_KEY added

What's Next
Continue Task 4.4 step 3: write `handleMessage(chatId, text)` — this is where Result chaining happens. Parse message, check result, route to TrelloService or ObsidianService based on type, check result, reply via `sendReply()`.

Blockers
None.

Failed Approaches
- First attempt at `sendReply`: used shared `request()` utility with Zod schema for Telegram response — over-engineered. Simplified to plain `fetch` with `response.ok` check.
- `chat_Id` variable name with wrong casing for Telegram API key — Telegram expects `chat_id` (snake_case).

This Week's Pattern
Over-engineering tendency — reached for Zod/request utility when plain fetch was sufficient. Ask "am I going to use this response data?" before adding validation.

Last Session

Date: 2026-02-13
Duration: ~30 min
Mode: Coach (70%) / Teach (30% — fire-and-forget pattern, when to skip Zod)
Kill? clean

Agent Reading Protocol

Read this file first
Read CLAUDE.md second
State in ONE sentence where we are
Wait for confirm
Begin

Do not summarize this file. Do not ask "what would you like to work on?" if What's Next has content.
