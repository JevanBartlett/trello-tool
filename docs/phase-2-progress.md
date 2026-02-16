# Phase 2 Progress

### Task 2.1: ObsidianService scaffold
- Created ObsidianService with vaultPath constructor
- getDailyNotePath() — sync, returns path string like `/vault/Daily/2026-02-04.md`
- appendToDaily() — creates Daily folder if needed, appends content
- createNote() / readNote() — basic file operations with Result pattern
- Learned: `fs.mkdir({ recursive: true })` ensures directory exists before write

### Task 2.2: Daily note conventions
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

### Task 2.3: Obsidian CLI commands
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

### Task 2.4: Search implementation
- Implemented `searchNotes()` using grep via `child_process` + `promisify`
- Wired to CLI as `notes search-note <query>`
- Handles grep exit codes: 0 = matches, 1 = no matches (not an error), 2 = real error
- Learned: **`child_process.exec`** — run shell commands from Node.js
- Learned: **`promisify`** — converts callback-style functions to Promise-style for async/await
- Learned: **Type guards** — `if (error && typeof error === 'object' && 'code' in error)` proves to TypeScript that a property exists before accessing it
- Learned: **grep exit codes** — 0 = found, 1 = not found (not an error), 2 = actual error
