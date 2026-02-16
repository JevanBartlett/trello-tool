# Phase 4 Progress

### Task 4.1: Telegram bot setup
- Created @CtxCapture_bot via BotFather
- Token stored in `.env`, loaded via `dotenv/config` (same as Trello creds)
- Added `telegram test` CLI command — hits `/getMe`, prints bot name/username/ID
- Added `telegram update-test` CLI command — hits `/getUpdates`, dumps raw JSON
- Sent "Hello world!" from Telegram, retrieved via `getUpdates` — saw `message.text` in response
- Learned: **Telegram API URL pattern** — `https://api.telegram.org/bot<token>/<method>` (token in URL path, unlike Trello's query params)
- Learned: **`getUpdates` returns an array** — each element is an update with different types (`my_chat_member`, `message`, etc.)
- Learned: **Bot vs service architecture** — Trello/Obsidian are destination services (push data to them), Telegram is the entry point/gateway (data comes from it). Different role = different architecture.
- Learned: **Token security hygiene** — revoke compromised tokens immediately, never paste in chat, store in `.env` with `.gitignore`
- Learned: **`JSON.stringify(data, null, 2)`** — pretty-print JSON for debugging (null = no replacer, 2 = indent spaces)

**Quick-check candidates for next session:** `??` nullish coalescing, `console.error()` vs `console.log()`

### Hardening session
- Added Zod `dateStringSchema` with `.refine()` + `.transform()` for date validation in `createCard` and `setDue`
- Learned: **Zod `.refine()`** — custom validation, returns true/false
- Learned: **Zod `.transform()`** — converts value after validation passes. Order matters: validate before transform
- Learned: **Zod `.safeParse()`** — returns `{ success, data }` or `{ success, error }` without throwing
- Made Obsidian `appendToDaily` resilient if `## Captured` marker is missing — appends marker + entry at end of file
- Learned: **`indexOf()` returns -1** when substring not found (not undefined)
- Descoped Phase 3 (Google Calendar) — moved to parking lot

### Session 2026-02-11
**Built/Changed:**
- `src/gateway/server.ts` — NEW. Express server with POST `/webhook` route. Receives Telegram updates, extracts message text, logs with timestamp, returns 200 OK.
- Installed `express` + `@types/express`
- Installed ngrok for local webhook testing
- Registered Telegram webhook via `setWebhook` API call

**Quick-check:** `?.` optional chaining — passed, graduated to Concepts Solidified. Correctly explained placement (`update.message?.text` guards `message`, not `update`).

**Quick-check candidates for next session:** `??` nullish coalescing, `console.error()` vs `console.log()`, Express route handlers

### Session 2026-02-12
**Built/Changed:**
- `src/gateway/parser.ts` — NEW. `parseMessage()` function calls Claude Haiku to classify text as task/note/unknown, extracts content and due dates. Zod validates response. `stripCodeBlock()` helper cleans markdown fences from LLM output.
- `src/index.ts` — Added `parser test` throwaway CLI command for testing
- Installed `@anthropic-ai/sdk`
- Added `ANTHROPIC_API_KEY` to `.env`
- Updated parking lot with board reading and daily summary ideas

**Bugs hit:**
1. Claude wrapped JSON in markdown code blocks → `JSON.parse()` failed. Fixed with `stripCodeBlock()`.
2. Claude returned `"dueDate": null` → Zod `.optional()` only allows undefined, not null. Fixed by adding `.nullable()`.

**Quick-check candidates for next session:** `z.enum()`, `slice()` with negative indices, `let` outside try / assign inside try scoping pattern, Result pattern flow

### Session 2026-02-13
**Built/Changed:**
- `src/gateway/server.ts` — Expanded `TelegramUpdate` interface with `chat.id: number`. Added `sendReply()` function: plain `fetch` POST to Telegram `sendMessage` API, logs failures, returns `void`.
- Task 4.4 in progress — steps 1-2 of 5 complete (interface + sendReply). Steps 3-5 remain (handleMessage, wire webhook, initialize services).

**Learned:**
- **When to skip Zod** — if you're not going to *use* the response data, don't validate it. Zod is for untrusted data you read from, not fire-and-forget calls.
- **camelCase vs snake_case mapping** — TypeScript variables use camelCase (`chatId`), but JSON keys sent to external APIs must match their spec (`chat_id` for Telegram).
- **Fire-and-forget pattern** — when a failure can't be recovered from (reply failed, can't reply to say reply failed), log it and move on. `console.error` + `return`, not `Result<T>`.
- **Data flow direction matters** — `sendReply` sends *to* Telegram, doesn't consume the response. Different from Trello calls where you use the returned card data.

**Quick-check:** Result pattern flow — partial. Described internal gates of a single Result-returning function correctly. Missed the chaining pattern (check first result, bail if bad, proceed to next call). Stays in "Still Working Through."

**Quick-check candidates for next session:** Result pattern chaining (hands-on in handleMessage), `z.enum()`, Express async route handlers

### Session 2026-02-14
**Built/Changed:**
- `src/gateway/server.ts` — Completed Task 4.4: full end-to-end wiring. Added `handleMessage()` with Result-based routing (parse → switch on type → TrelloService/ObsidianService → reply). Fixed import order bug (dotenv must load before parser). Fixed two TypeScript type errors. Cleaned up stale TODO and typo. Live tested: Telegram → Claude parse → Trello card → bot reply.
- Config: set `trello.defaultInboxListId` in `~/.ctx/config.json` for live testing.

**Learned:**
- **Import order matters with side effects** — `import 'dotenv/config'` must come before any module that reads `process.env` at load time. Parser creates Anthropic client at import time, so if dotenv hasn't run yet, the API key is `undefined`. Silent failure — no error, just empty credentials.
- **Module-level narrowing doesn't carry into functions** — TypeScript narrows `trellodefaultlist` after `process.exit(1)` guard at module level, but inside `handleMessage()` it reverts to `string | undefined`. Fix: non-null assertion `!`.
- **`??` nullish coalescing bridges null vs undefined** — Parser's `dueDate` is `string | null | undefined` (from Zod `.nullable().optional()`), but `createCard` expects `string | undefined`. Fix: `safeData.dueDate ?? undefined` converts null to undefined.
- **Hidden TypeScript errors** — when one function argument fails type checking, subsequent argument errors may be hidden until the first is fixed.
- **Unchecked Result values** — `createCard` returns a Result but `handleMessage` doesn't check it. Card creation can fail silently while the bot replies "success". (Tracked for Task 4.5.)
- **`tsc` vs `tsc --noEmit`** — `tsc` emits .js files (build), `tsc --noEmit` only checks types (typecheck). Use `npm run typecheck` not raw `tsc`.
- **502 Bad Gateway from ngrok** — means ngrok is running but nothing is listening on localhost:3000. Server was stopped.
- **`source .env` vs dotenv** — `.env` is for Node's dotenv, not the shell. `source` may include quotes from the file format.

**Bugs hit:**
1. Import order: dotenv loaded after parser → Anthropic client created with undefined API key → all parsing fails with "cactus" reply. Fixed by moving `import 'dotenv/config'` to line 1.
2. Trello card not created despite success reply — `"thursday"` not a valid Trello date. `createCard` Result not checked. (Task 4.4a-7 + 4.5.)

**Quick-check candidates for next session:** `z.enum()`, Express async route handlers, Result return value checking

### Session 2026-02-14 (session 2) — Task 4.4a Hardening
**Built/Changed:**
- `src/gateway/server.ts` — Webhook auth: checks `X-Telegram-Bot-Api-Secret-Token` header, returns 401 on mismatch. Startup guards for all env vars (`TELEGRAM_WEBHOOK_SECRET`, `TRELLO_API_KEY`, `TRELLO_TOKEN`, `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`). Removed `!` non-null assertions. Removed dead runtime check in `sendReply`.
- `src/services/obsidian-service.ts` — `safePath()` private helper: resolves path with `path.resolve()`, blocks if result escapes vault. `buildDate()` private helper: local timezone date string. Both `createNote` and `readNote` use `safePath`. Both `getDailyNotePath` and `appendToDaily` use `buildDate`.
- `src/gateway/parser.ts` — `SYSTEM_PROMPT` constant → `buildSystemPrompt()` function. Injects today's local date. Instructs Haiku to return YYYY-MM-DD instead of "thursday".
- `src/utils/request.ts` — `response.json()` wrapped in try/catch, returns `PARSE_ERROR` Result on failure.
- `src/services/config-service.ts` — `readFileSync` moved inside try/catch block.
- `src/types/trello.ts` — `LabelSchema.color` now `.nullable()`.

**Learned:**
- **Webhook authentication** — Telegram sends `X-Telegram-Bot-Api-Secret-Token` header when you register with `secret_token` param. Server verifies header matches, rejects 401 otherwise. Both sides need the secret.
- **`req.headers` is an object, not a function** — access with bracket notation `req.headers['header-name']`, not parentheses. Dashes in header names require brackets (can't use dot notation).
- **`return` after `res.sendStatus()`** — without it, Express keeps executing and tries to send a second response, throwing "headers already sent" error.
- **`===` vs `==`** — strict equality is TypeScript convention, avoids type coercion edge cases.
- **Path traversal attack** — user input like `../../etc/passwd` in a file path escapes the intended directory. `path.resolve()` normalizes it, then `startsWith()` checks containment.
- **Private helper methods** — `private` means only callable inside the class. Good for internal safety checks not part of the public API.
- **UTC vs local time** — `toISOString()` always returns UTC. At 11pm Eastern, UTC is already tomorrow. Use `getFullYear()`/`getMonth()`/`getDate()` for local time. `getMonth()` is zero-indexed.
- **`padStart(2, '0')`** — turns `9` into `09` for consistent date formatting.
- **Fail-fast startup** — validate all required config before creating services. Crash with clear message instead of mysterious failures later. Once validated, `!` assertions are unnecessary.
- **Dead code removal** — if startup guarantees a value exists, per-call checks for that value are dead code.
- **`.nullable()` vs `.optional()` in Zod** — `.nullable()` accepts `null` (field present, value null). `.optional()` accepts `undefined` (field missing). Different things.

**Quick-check candidates for next session:** `path.resolve()` behavior, webhook auth flow, `getMonth()` zero-indexing
