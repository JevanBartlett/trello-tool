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

### Error Handling
- Error re-throwing — why `throw error` in catch blocks, how errors propagate [added: P1]
- Custom error classes — `extends Error`, public constructor params, calling `super()` [added: P1]
- Error handling architecture — where to throw (API layer) vs where to catch (CLI layer) [added: P1]
- `instanceof` for type-checking — how it works with class hierarchies [added: P1]
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

### Patterns / Architecture
- Separation of concerns — API module throws structured errors, CLI formats for user [added: P1]
- Commander `.option()` — options come as object in last callback parameter [added: P1]
- Zod `.refine()` / `.transform()` / `.safeParse()` — custom validation, value conversion, safe parsing [added: P2]
- Architectural thinking — services (destinations) vs gateway (entry point), which component owns which responsibility [added: P4]

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

---

## Phase 2 Progress

### Task 2.1: ObsidianService scaffold ✅
- Created ObsidianService with vaultPath constructor
- getDailyNotePath() — sync, returns path string like `/vault/Daily/2026-02-04.md`
- appendToDaily() — creates Daily folder if needed, appends content
- createNote() / readNote() — basic file operations with Result pattern
- Learned: `fs.mkdir({ recursive: true })` ensures directory exists before write

### Task 2.2: Daily note conventions ✅
- Created `getDailyTemplate(date)` — returns markdown structure with Captured/Tasks Created/Notes sections
- Created `formatTime()` — returns "2:47pm" format using `toLocaleTimeString()` with options
- Rewrote `appendToDaily()` to handle file creation vs insertion:
  - Uses nested try/catch: inner catches ENOENT (file not found), re-throws other errors
  - If no file: create from template, insert entry after `## Captured\n`
  - If file exists: read content, insert entry after `## Captured\n`
  - Uses `indexOf()` to find marker, `slice()` to split and sandwich new content
- Learned: `toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })`
- Learned: `NodeJS.ErrnoException` type cast for accessing `.code` on fs errors
- Learned: Variable shadowing — `let x` inside inner block creates new variable, doesn't assign to outer
- Learned: String insertion pattern: `before.slice(0, point) + newStuff + before.slice(point)`

### Task 2.3: Obsidian CLI commands ✅
- Refactored ConfigService to nested schema structure (trello/obsidian sections)
- Added `setObsidianVaultPath()` with nested spread pattern
- Created `notes` subcommand group in CLI with: daily, append, create-note, search-note
- ObsidianService initialized conditionally based on config
- Learned: **Nested spread pattern** — `{ ...outer, inner: { ...outer.inner, key: value } }` for immutable nested updates
- Learned: **Commander subcommand groups** — `program.command('notes')` creates namespace, then chain `.command()` off that
- Learned: **Optional chaining** — `config.data.obsidian?.defaultVaultPath` returns undefined if obsidian is missing
- Learned: **Nullish coalescing** — `?? '(not set)'` for fallback when value is null/undefined
- Learned: **YAGNI lesson** — spent too long debating config architecture for 3-4 keys. Start simple, refactor when it hurts

### Session 2026-02-08
**Built/Changed:**
- `obsidian-service.ts` — Made `appendToDaily` resilient when `## Captured` marker missing
- `obsidian-service.ts` — Implemented `searchNotes()` using grep + child_process
- `trello.ts` — Added `dateStringSchema` (Zod refine + transform) for date validation
- `trello-service.ts` — Applied date validation to `createCard` and `setDue` with `safeParse`
- `index.ts` — Wired `search-note` CLI command with null guard and error handling
- `task-plan.md` — Descoped Phase 3 (Google Calendar), updated CLAUDE.md pointer
- `notes.md` — Moved Google Calendar to parking lot

### Task 2.4: Search implementation ✅
- Implemented `searchNotes()` using grep via `child_process` + `promisify`
- Wired to CLI as `notes search-note <query>`
- Handles grep exit codes: 0 = matches, 1 = no matches (not an error), 2 = real error
- Learned: **`child_process.exec`** — run shell commands from Node.js
- Learned: **`promisify`** — converts callback-style functions to Promise-style for async/await
- Learned: **Type guards** — `if (error && typeof error === 'object' && 'code' in error)` proves to TypeScript that a property exists before accessing it
- Learned: **grep exit codes** — 0 = found, 1 = not found (not an error), 2 = actual error

## Phase 4 Progress

### Task 4.1: Telegram bot setup ✅
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
