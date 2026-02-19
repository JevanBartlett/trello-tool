# Research Notes

## Concepts Solidified
- Commander multiple arguments (`.argument()` chaining, `<>` vs `[]`)
- POST requests need method, headers, and body
- `JSON.stringify()` converts objects to JSON strings
- Optional TypeScript parameters (`param?: type`)
- PUT vs POST (PUT updates existing resources, POST creates new ones)
- `URL.searchParams.set()` for building query strings safely
- API parameter names must match documentation exactly
- Multi-step API workflows (board → list → card ID chains)
- Ternary for conditional values (`condition ? valueIfTrue : valueIfFalse`)
- `param: string | undefined` vs `param?: string` — Commander always passes args, use former
- `import type` vs `import` — use `import type` for types only used in annotations, regular `import` for runtime values (schemas)
- When async is needed — I/O operations (disk, network) vs pure computation (string building)
- `fs.promises` — async file operations (`readFile`, `writeFile`, `appendFile`, `mkdir`)
- `path.dirname()` — extracts directory portion from a full file path
- `fs.mkdir({ recursive: true })` — creates directory safely (no error if exists, creates parents)
- `?.` optional chaining — short-circuits to undefined when left side is null/undefined. Placement matters: `obj.prop?.nested` guards `prop`, not `obj`
- Error re-throwing — why `throw error` in catch blocks, how errors propagate [graduated: P4A]
- Custom error classes — `extends Error`, public constructor params, calling `super()` [graduated: P4A]
- `instanceof` for type-checking — how it works with class hierarchies [graduated: P4A]
- Separation of concerns — API module throws structured errors, CLI formats for user [graduated: P4A]
- Commander `.option()` — options come as object in last callback parameter [graduated: P4A]

## Still Working Through

### TypeScript / Language
- `??` nullish coalescing — fallback for null/undefined, watch operator precedence [added: P1]
- TypeScript utility types — `Record<K, V>`, what others exist, when to use them [added: P1]
- `Result<T>` pattern and generics — need deliberate practice with `<T>` syntax [added: P1]
- TypeScript generics in general — `Array<T>`, `Promise<T>`, custom generics [added: P1]
- `Object.entries()` — what it returns, how to use it [added: P1]
- Array destructuring in loops — `for (const [key, value] of ...` [added: P1]
- Variable shadowing — `let x` in inner block vs assigning to outer `x` [added: P2]
- Variable scoping in if blocks — `const` inside `if` isn't accessible outside it [added: P2]
- Type guards — proving to TypeScript that a property exists before accessing it [added: P2]
- Deriving TypeScript generics — read and write all utility types (`Record`, `Partial`, `Pick`, `Omit`, `ReturnType`, `Parameters`, etc.) plus custom generics. Drill one per session until automatic [added: P4A]

### Error Handling
- ENOENT pattern — `(error as NodeJS.ErrnoException).code` for file system errors [added: P2]
- Nested try/catch — inner catches specific error, re-throws others to outer handler [added: P2]

### Node.js / Runtime
- `tsc` vs `tsx` — when to use which, what each actually does under the hood [added: P1]
- `console.error()` vs `console.log()` — stderr vs stdout separation [added: P1]
- `fs.readFile()` — read file contents as string, needs `'utf-8'` encoding [added: P2]
- `fs.writeFile()` — write/overwrite file contents [added: P2]
- `fs.appendFile()` — append to end of file (creates if doesn't exist) [added: P2]
- `fs.mkdir()` — create directory, `{ recursive: true }` for nested paths [added: P2]
- `child_process.exec` + `promisify` — running shell commands from Node.js with async/await [added: P2]
- `exec` vs `execFile` — exec uses shell (injection risk), execFile passes args as array (safe) [added: P2]
- `toLocaleTimeString()` with options — need more practice with formatting options [added: P2]
- String insertion with indexOf/slice — finding position, splitting, sandwiching [added: P2]
- `indexOf()` returns -1 when not found — not undefined, not 0 [added: P2]
- Grep exit codes — 0 found, 1 not found, 2 error. Non-zero doesn't always mean failure [added: P2]

### Express / HTTP Server
- `express()` — creates app instance, `app.use()` adds middleware, `app.post()` adds route handler, `app.listen()` starts server [added: P4]
- Middleware concept — `express.json()` parses incoming JSON bodies; function call `()` required because it returns the middleware [added: P4]
- Route handlers — `(req: Request, res: Response) => {}`, req has incoming data, res sends response back [added: P4]
- `res.sendStatus(200)` — sends bare status code response with no body [added: P4]
- Ports — apartment numbers on your machine (0–65535), 3000 is convention for local dev [added: P4]

### Webhooks / Networking
- Webhook vs polling — polling = you ask for updates, webhook = service pushes to your URL [added: P4]
- ngrok — creates temporary public URL tunneling to localhost for webhook testing [added: P4]
- Telegram `setWebhook` — tells Telegram where to POST new messages [added: P4]

### LLM / Claude API
- Anthropic SDK — `new Anthropic()` creates client, `client.messages.create()` sends requests. Response has `content[0].text` (string) and `usage` (token counts) [added: P4]
- System prompts — instructions Claude sees before every message. Controls behavior (parser role, output format, examples) [added: P4]
- `max_tokens` — caps Claude's **response** length, not input. 256 tokens ≈ 200 words of output [added: P4]
- Model selection for cost — Haiku for simple classification, Sonnet/Opus for complex reasoning. Start cheap, scale up [added: P4]
- LLM output cleaning — models may wrap JSON in markdown code blocks. Strip before `JSON.parse()`. Belt and suspenders: prompt says "no code blocks" AND code strips them [added: P4]
- `z.enum()` — restricts a string to specific allowed values. `z.enum(['task', 'note', 'unknown'])` rejects anything else [added: P4]

### Patterns / Architecture
- Zod `.refine()` / `.transform()` / `.safeParse()` — custom validation, value conversion, safe parsing [added: P2]
- Architectural thinking — services (destinations) vs gateway (entry point), which component owns which responsibility [added: P4]
- Result pattern flow — try something risky → fail early with error → keep going → return success at the end. Each step is a gate [added: P4]
- `.nullable()` vs `.optional()` in Zod — `.optional()` allows undefined (field missing), `.nullable()` allows null (field present but null). LLMs often return null instead of omitting [added: P4]

### Import / Module System
- Function reference vs function call — `express.json` passes the function, `express.json()` calls it and passes the return value [added: P4]
- CJS interop with `verbatimModuleSyntax` — CommonJS packages need special import syntax depending on tsconfig [added: P4]

## Bug Journal
When a meaningful bug occurs, log:
- Symptom
- Root cause
- How I found it
- Prevention (test, lint rule, type, invariant)

---
## Parking Lot (Future Ideas)
- Google Calendar integration — descoped from Phase 3. OCR input unreliable, can't import behind firewall. Revisit if a better input method appears.
- Telegram bot reads tasks from a board — "what are my tasks for today?" (related: Task 6.2 `/tasks` command)
- Daily task summary with time context — surface due-today items automatically (related: Task 6.3 daily digest)
- Comparable projects to review (learning system + automation patterns):
  - OpenHands AGENTS.md + Skills model — instruction modularity, agent workflow structure (`https://docs.all-hands.dev/modules/usage/prompting/agents-md`, `https://docs.all-hands.dev/modules/usage/prompting/skills`)
  - Continue prompt files — reusable prompt modules/frontmatter patterns (`https://docs.continue.dev/customize/tutorials/prompt-files`)
  - n8n Telegram Trigger + Trello node — mature workflow reliability/retry patterns (`https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/`, `https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.trello/`)
  - Obsidian Trello plugin — note/task bridge UX ideas (`https://github.com/nathonius/obsidian-trello`)
  - Mem0 — AI memory indexing/retrieval patterns (`https://github.com/mem0ai/mem0`)
  - FSRS4Anki — spaced repetition scheduling approach for quick-check evolution (`https://github.com/open-spaced-repetition/fsrs4anki`)

---

## Phase 4A Progress

### Session 2026-02-15 — Task 4A.1: Define tool schemas
**Built/Changed:**
- `src/agent/tools.ts` — NEW. 10 Zod input schemas + Anthropic tool definitions array. Schemas define what the LLM sends to each tool. Descriptions guide Haiku on when to use each tool.
- `.claude/settings.json` — Added checkpoint gate prompt hook on Edit|Write

**Tools defined:** create_task, get_boards, get_lists, get_cards, move_card, archive_card, set_due_date, append_note, search_notes, read_daily

**Design decisions:**
- Added `get_boards` and `get_lists` (not in original 8) — agent needs to discover boards/lists to sort inbox cards
- `create_task.list_id` is optional — defaults to configured inbox, but agent can target a specific list
- Snake_case field names (not Trello's `idList`) — clearer for the LLM, executor handles the mapping
- Zod v4 native `z.toJSONSchema()` — no extra library needed. Tried `zod-to-json-schema` first, hit version incompatibility with Zod v4

**Learned:**
- **Zod v4 built-in JSON Schema** — `z.toJSONSchema(schema)` converts Zod to JSON Schema natively. No need for `zod-to-json-schema` library (which was built for Zod v3).
- **Tool descriptions matter** — they're how the LLM decides which tool to call. Write them for "when to use" not just "what it does."
- **Input schemas vs output schemas** — existing Zod schemas (CardSchema, BoardSchema) validate API responses. Tool input schemas are separate — they define what the LLM sends. Different direction, different shape.
- **`tsx -e` file resolution** — inline eval needs `.ts` extension, unlike normal imports that use `.js` (Node ESM convention).
- **Claude Code hooks** — `PreToolUse` with prompt type can enforce workflow gates. Exit 2 blocks, stderr feeds back to Claude. Prompt hooks use a small model to evaluate conditions intelligently.

**Quick-check candidates for next session:** `z.toJSONSchema()` output shape, tool description writing, Anthropic tool use API message format

### Session 2026-02-16 — Task 4A.2: Build the agent loop
**Built/Changed:**
- `src/agent/agent.ts` — NEW. Agent loop with `runAgent(userMessage)` returning `Result<string>`. While loop calls Haiku with tools, accumulates messages, branches on `stop_reason`. Executor is a stub (4A.3).
- `src/agent/tools.ts` — Added `Anthropic.Tool[]` typing and `as Anthropic.Tool.InputSchema` casts on all 10 tools. Bridges Zod v4 JSON Schema output with Anthropic SDK types.

**Design decisions:**
- `Result<string>` return type (not plain string) — consistent with rest of codebase, three error paths (NETWORK_ERROR, AGENT_ERROR, AGENT_LOOP_LIMIT)
- System prompt rewritten for tool use — no JSON examples, no classifier language. Tool definitions serve as the schema.
- Model extracted to `const model` — single line change to swap
- `executeTool()` stub uses `Promise.resolve()` without `async` — satisfies `require-await` lint rule

**Learned:**
- **Agent loop pattern** — while loop, not single call. Each iteration: call Haiku → push assistant response → check stop_reason → if tool_use, execute tools, push results, continue. If end_turn, extract text, return.
- **Message accumulation** — conversation state grows each iteration. Assistant response (including tool_use blocks) AND tool results both get pushed. Haiku sees full history on next call.
- **`tool_result` uses `role: 'user'`** — Anthropic protocol. Tool results are sent as user messages, not a special role. `tool_use_id` ties each result to its request.
- **`response.content` is an array of blocks** — can contain `text` and `tool_use` blocks mixed. Filter by `.type` to extract what you need.
- **Bridging library types with casts** — `z.toJSONSchema()` returns generic JSON Schema, Anthropic SDK expects `{ type: 'object' }` literal. Cast with `as Anthropic.Tool.InputSchema`. One-time cost per tool.
- **`Promise.resolve()` vs `async`** — returning `Promise.resolve(value)` makes a function return a Promise without `async`. Useful for stubs where the real implementation will be async.
- **`setTimeout` returns `Timeout`, not a value** — can't await it for a string result. Not a Promise.

**Quick-check candidates for next session:** message accumulation flow (what gets pushed when), `stop_reason` values, `tool_use_id` purpose, `Result<string>` error codes in agent

### Session 2026-02-17 — Task 4A.3: Wire the executor
**Built/Changed:**
- `src/agent/executor.ts` — NEW. Factory function `createExecutor(deps)` returns `executeTool` function. 10 switch cases covering all tools. Each case: safeParse input → call service → unwrap Result into string for Haiku.
- `src/agent/agent.ts` — Removed `executeTool` stub. `runAgent()` now takes `executeTool` as second parameter (dependency injection).

**Design decisions:**
- Factory function pattern — `createExecutor(deps)` captures services via closure, returns the `executeTool` function. Agent loop doesn't import services directly.
- `ExecutorDeps` interface — explicit dependency declaration: `trello`, `obsidian`, `defaultListId`. No hidden env reads.
- `read_daily` skips safeParse — `ReadDailyInput` is empty object, nothing to validate. Gets path from `deps.obsidian.getDailyNotePath()` directly.
- Tool name strings must match `tools.ts` exactly — caught `create-task` vs `create_task` and `search_note` vs `search_notes` mismatches.

**Learned:**
- **Factory functions** — function that returns a function. Outer function receives dependencies, inner function (returned) uses them via closure. Caller gets a ready-to-use function without knowing about the dependencies. Pattern: `const fn = createThing(deps)` → `fn(args)`.
- **Function type syntax** — `(name: string, input: Record<string, unknown>) => Promise<string>` as a return type annotation. The whole thing goes after the `:` in the function signature.
- **`.map()` + `.join()`** — `.map()` transforms each array element, `.join('\n')` combines the resulting array into a single string. Two separate operations chained.
- **Case block scoping** — `{ }` after `case` creates block scope so `const` declarations don't collide between cases.

**Drilled:** message accumulation flow → PARTIAL (knew user/assistant push, missed tool_result shape and tool_use_id linkage)

**Quick-check candidates for next session:** factory functions (write one from scratch), tool_result message shape, `getDailyNotePath()` absolute vs relative path interaction with safePath

### Session 2026-02-18 — Task 4A.4: Update the gateway
**Built/Changed:**
- `src/gateway/server.ts` — Replaced `handleMessage()`. Removed `parseMessage()` + switch dispatch. Now calls `runAgent(text, executeTool)` directly. Executor created at module level via `createExecutor(deps)`. Removed `ParsedMessage` and `Result` imports. Return type simplified from `Promise<Result<ParsedMessage>>` to `Promise<void>` — sends reply inside the function.

**Design decisions:**
- Executor at module level — deps (trello, obsidian, defaultListId) don't change between messages, so create once at startup, not per-request.
- `handleMessage` returns `void` — it owns sending the reply via `sendReply()`. No need to return a Result since nobody inspects the return value.
- Error path still replies to user — agent failure sends "Something went wrong. Try again" so the user isn't left hanging.

**Learned:**
- **Agent replaces parser, not wraps it** — the whole `parseMessage()` → switch → service call chain collapses into one `runAgent()` call. The LLM picks tools, the executor calls services. No routing logic in the gateway.
- **Return type follows usage** — if nobody inspects a return value, `void` is the right type. `Result<T>` is for callers that branch on success/failure.
- **Module-level initialization** — when dependencies are stable (same services, same config), create once at top level. Avoids unnecessary object creation per request.

**Drilled:** factory functions → PARTIAL (got the shape — outer takes config, returns inner function — but tangled parameter names in return type annotation, mixed up which function gets which param, `void` vs `string` return)

**Still fuzzy (self-reported):** HOFs/factory functions (writing the type annotations), webhook handling flow (Express route → handler → reply)

**Quick-check candidates for next session:** factory function return type annotation (write the type signature cold), Express webhook flow (what calls what), `Result<T>` vs `void` return — when to use which
