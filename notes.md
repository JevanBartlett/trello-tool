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

## Still Working Through
- Commander `.option()` — options come as object in last callback parameter, different from `.argument()`
- `tsc` vs `tsx` — when to use which, what each actually does under the hood
- Error re-throwing — why `throw error` in catch blocks, how errors propagate
- TypeScript utility types — `Record<K, V>`, what others exist, when to use them
- `Object.entries()` — what it returns, how to use it
- Array destructuring in loops — `for (const [key, value] of ...)`
- Custom error classes — `extends Error`, public constructor params, calling `super()`
- Error handling architecture — where to throw (API layer) vs where to catch (CLI layer)
- `instanceof` for type-checking — how it works with class hierarchies
- `console.error()` vs `console.log()` — stderr vs stdout separation
- Separation of concerns — API module throws structured errors, CLI formats for user
- `?.` optional chaining — short-circuits to undefined when left side is null
- `??` nullish coalescing — fallback for null/undefined, watch operator precedence
- `Result<T>` pattern and generics — need deliberate practice with `<T>` syntax
- TypeScript generics in general — `Array<T>`, `Promise<T>`, custom generics
- `toLocaleTimeString()` with options — need more practice with formatting options
- ENOENT pattern — `(error as NodeJS.ErrnoException).code` for file system errors
- Nested try/catch — inner catches specific error, re-throws others to outer handler
- Variable shadowing — `let x` in inner block vs assigning to outer `x`
- String insertion with indexOf/slice — finding position, splitting, sandwiching
- `fs.readFile()` — read file contents as string, needs `'utf-8'` encoding
- `fs.writeFile()` — write/overwrite file contents
- `fs.appendFile()` — append to end of file (creates if doesn't exist)
- `fs.mkdir()` — create directory, `{ recursive: true }` for nested paths
- `child_process.exec` + `promisify` — running shell commands from Node.js with async/await
- Type guards — proving to TypeScript that a property exists before accessing it
- Grep exit codes — 0 found, 1 not found, 2 error. Non-zero doesn't always mean failure.
- Zod `.refine()` / `.transform()` / `.safeParse()` — custom validation, value conversion, safe parsing
- Variable scoping in if blocks — `const` inside `if` isn't accessible outside it
- `indexOf()` returns -1 when not found — not undefined, not 0

## Bug Journal
When a meaningful bug occurs, log:
- Symptom
- Root cause
- How I found it
- Prevention (test, lint rule, type, invariant)

---
## Parking Lot (Future Ideas)
- Google Calendar integration — descoped from Phase 3. OCR input unreliable, can't import behind firewall. Revisit if a better input method appears.

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

### Hardening session
- Added Zod `dateStringSchema` with `.refine()` + `.transform()` for date validation in `createCard` and `setDue`
- Learned: **Zod `.refine()`** — custom validation, returns true/false
- Learned: **Zod `.transform()`** — converts value after validation passes. Order matters: validate before transform
- Learned: **Zod `.safeParse()`** — returns `{ success, data }` or `{ success, error }` without throwing
- Made Obsidian `appendToDaily` resilient if `## Captured` marker is missing — appends marker + entry at end of file
- Learned: **`indexOf()` returns -1** when substring not found (not undefined)
- Descoped Phase 3 (Google Calendar) — moved to parking lot
