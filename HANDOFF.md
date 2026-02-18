HANDOFF.md

Read this file FIRST. Hot session state. Everything else is reference.

Task

Objective: Build Telegram bot gateway — the product's front door
Phase / Task: Phase 4A / Task 4A.3: Wire the executor
Status: COMPLETE

Progress
Task 4A.3 complete. Created `src/agent/executor.ts` with:
- `createExecutor(deps)` factory function — takes `ExecutorDeps` (trello, obsidian, defaultListId), returns `executeTool` function via closure
- 10 switch cases matching all tools in `tools.ts`
- Each case: safeParse input with Zod schema → call service method → unwrap `Result<T>` into string for Haiku
- `read_daily` skips safeParse (empty input schema) — uses `getDailyNotePath()` directly
- Error strings prefixed with `PARSING_ERROR:` or `SERVICE_ERROR:` so Haiku can interpret failures

Also this session:
- Removed `executeTool` stub from `agent.ts`
- `runAgent()` now takes `executeTool` as second parameter (dependency injection — agent loop doesn't import services)
- Graduated 5 concepts from "Still Working Through" to "Concepts Solidified"

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
- `runAgent()` returns `Result<string>` not plain `string` — consistent error handling with rest of codebase
- `Anthropic.Tool.InputSchema` cast on each tool's `input_schema` — bridges Zod's generic JSON Schema type with SDK's literal `type: 'object'` requirement
- Agent system prompt has no examples — tool definitions serve as the schema, not prompt-engineered JSON examples
- Model extracted to `const model` — single line change to swap models
- Factory function `createExecutor(deps)` — captures services via closure, returns `executeTool`. Agent loop receives function as parameter, no service imports needed.
- `ExecutorDeps` interface — explicit dependency declaration (trello, obsidian, defaultListId). No hidden env reads in executor.
- `read_daily` skips safeParse — empty input schema, nothing to validate
- `runAgent` takes `executeTool` as second parameter — dependency injection via function arg, not imports or globals

Files in Play
- `src/agent/executor.ts` — NEW. Factory function, 10 tool cases, Zod validation, Result unwrapping
- `src/agent/agent.ts` — Agent loop: runAgent(userMessage, executeTool), buildSystemPrompt(). Stub removed.
- `src/agent/tools.ts` — 10 Zod input schemas + Anthropic tool definitions array (typed as Anthropic.Tool[])
- `src/gateway/server.ts` — Webhook auth guard, startup env validation, handleMessage routing, Result-checked writes
- `src/gateway/parser.ts` — `buildSystemPrompt()` with dynamic date, YYYY-MM-DD due date format (will be replaced by agent in 4A.4)
- `src/services/obsidian-service.ts` — `safePath()` guard with `path.sep` fix, `buildDate()` local timezone helper
- `src/services/config-service.ts` — `readFileSync` inside try/catch
- `src/utils/request.ts` — `response.json()` try/catch for non-JSON responses
- `src/types/trello.ts` — `LabelSchema.color` nullable
- `~/.ctx/config.json` — Has `trello.defaultInboxListId` and `obsidian.defaultVaultPath`
- `.claude/settings.json` — Hooks: protect-files, block-secret-leaks, checkpoint gate, session-end, pre-compact, inject-context
- `task-plan.md` — Task 6.0 added for deferred hardening items

What's Next
Task 4A.4: Update the gateway. Replace `handleMessage()` in server.ts to call `runAgent()` instead of `parseMessage()` + switch. Need to: import `createExecutor` and `runAgent`, create executor with deps (trello, obsidian, defaultListId), pass resulting function to `runAgent()`. Small task — mostly wiring.

Known Issues
1. `buildDate()` duplicated in obsidian-service and parser — could extract to shared utility later
2. `getDailyNotePath()` returns absolute path, `readNote()` runs it through `safePath()` — works because absolute path starts with vaultPath, but coupling is fragile

Blockers
None.

Failed Approaches
- First attempt at `sendReply`: used shared `request()` utility with Zod schema for Telegram response — over-engineered. Simplified to plain `fetch` with `response.ok` check.
- Import order: `dotenv/config` was imported after parser — Anthropic client created with undefined API key, all parsing silently failed.
- `zod-to-json-schema` library — incompatible with Zod v4. Switched to native `z.toJSONSchema()`.
- Tried typing `GetBoardsInput: Anthropic.Tool = z.object({})` — mixed Zod schema with Anthropic tool type. Fix: type annotations go on the `tools` array and `input_schema` casts, not on individual Zod schemas.
- `setTimeout` in executeTool stub — returns `Timeout` object not string, wrong callback syntax, unnecessary complexity for a placeholder.
- `create-task` (hyphen) instead of `create_task` (underscore) in executor switch — tool names must match tools.ts exactly.
- `search_note` (singular) instead of `search_notes` (plural) — same issue, exact match required.
- `parsed.data.string` on `read_daily` — ReadDailyInput is empty object, no fields. Use `getDailyNotePath()` instead.
- Tried `Result<ExecutorDeps>` as return type of `createExecutor` — factory isn't async, doesn't do I/O, just returns a function.

This Week's Pattern
Executor pattern — factory function that captures dependencies via closure and returns a tool dispatch function. The agent loop calls the function without knowing about services. Each tool case: validate input → call service → unwrap Result → return string.

Last Session

Date: 2026-02-17
Duration: ~45 minutes
Mode: Teach (factory functions, executor pattern, function type syntax)
Kill? clean

Agent Reading Protocol

Read this file first
Read CLAUDE.md second
State in ONE sentence where we are
Wait for confirm
Begin

Do not summarize this file. Do not ask "what would you like to work on?" if What's Next has content.
