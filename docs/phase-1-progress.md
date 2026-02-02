# Phase 1 Progress Log

## 2025-01-04: Project setup complete

- GitHub repo created: https://github.com/JevanBartlett/trello-tool
- SSH key configured for GitHub authentication (ed25519)
- Initial commit pushed with project scaffolding
- Tools configured: TypeScript, ESLint, Prettier, Husky (pre-commit hooks)

## 2025-01-05: Week 1 complete - First API calls working

- Task 1.2: Trello credentials stored in .env
- Task 1.3: First API call to /members/me successful (username: joshbartlett16)
- Task 1.4: Fetched all boards via /members/me/boards
- Installed dotenv package for loading .env
- Learned: ES modules + ts-node don't mix well; use `npm run build && npm start` instead
- Learned: ESLint strict mode flags `any` types from response.json() — use `unknown`

## 2025-01-10: Task 1.5 complete - API module refactored

- Created src/api/client.ts with buildURL(), getData(), getBoards(), getMe()
- Learned: URL constructor trailing slash matters for relative paths:
  - `new URL("path", "https://example.com/1")` → replaces `/1` with `path`
  - `new URL("path", "https://example.com/1/")` → appends `path` after `/1/`
- Added TRELLO_BASE_URL to .env (with trailing slash)
- Using `as` casts for now, but uncomfortable with it — next task is Zod validation
- Installed zod for runtime schema validation (Task 1.6)
- Next: Convert interfaces to Zod schemas, remove casts

## 2025-01-19: Tasks 1.6 & 1.7 complete - Zod validation and CLI structure

- Task 1.6: Converted all interfaces to Zod schemas, types inferred with `z.infer<typeof Schema>`
- Task 1.7: Installed commander, created `boards` and `get-user` commands
- Fixed ESLint config: `recommendedTypeChecked` was applying to all files including `.mjs`
  - Solution: Scope type-checked rules to `files: ['**/*.ts']` only
  - Added Node.js globals (`process`) for `.mjs` files
- Learned: `tsx` vs `tsc` build workflow:
  - `npx tsx src/index.ts` — compiles on-the-fly, good for development
  - `npm run build && node dist/index.js` — pre-compile, good for production
  - TypeScript must become JavaScript before Node can run it
  - `tsx` hides this by compiling in memory each run
  - Production servers don't have `tsx`, so you ship compiled `dist/` folder
- Commander basics:
  - `new Command()` creates program instance
  - `.command('name')` defines subcommand
  - `.action(async () => {})` is the handler
  - `program.parse()` reads process.argv and dispatches

## 2025-01-21: Task 1.8 complete - Fetch lists for a board

- Added `getList(boardID)` function with parameterized endpoint `/boards/${boardID}/lists`
- Created `get-list <board-id>` command using Commander's `.argument('<name>')`
- Learned: Commander `.argument()` for positional args
  - `<name>` = required, `[name]` = optional
  - Value passed as first parameter to `.action()` callback
- Reinforced: `tsc` compiles, `tsx` compiles AND runs
  - `npx tsc src/index.ts get-list ...` fails because tsc treats args as file paths
  - `npx tsx src/index.ts get-list ...` works because tsx runs the program

## 2025-01-22: Task 1.9 complete - Fetch cards for a list

- Added `getCards(listID)` function to client.ts with endpoint `/lists/${listID}/cards`
- Created `get-cards <list-id>` command following same pattern as get-list
- Bug caught: Initially wrote `.command('get cards')` with space instead of hyphen
  - Commander interprets space as nested subcommand structure
  - Fixed to `.command('get-cards')` to match CLI convention
- Observation: Commands now inconsistent in naming (`boards` vs `get-user` vs `get-list` vs `get-cards`)
  - Will be addressed in Task 1.14/1.15 (formatting and help text)

## 2025-01-22: Task 1.10 complete - Create a card (first write operation)

- Added `createCard(listID, cardName, description?)` function with POST request
- Learned: POST requests with fetch require method, headers, and body
  - `method: 'POST'` - specifies HTTP method
  - `headers: { 'Content-Type': 'application/json' }` - tells server we're sending JSON
  - `body: JSON.stringify(body)` - converts object to JSON string
- Created `create-card` command with multiple arguments:
  - `.argument('<list-id>')` - required
  - `.argument('<name>')` - required
  - `.argument('[description]')` - optional (square brackets)
  - Arguments map to action callback parameters in order
- Fixed error handling: added `throw error` in catch blocks
  - Without re-throw, functions return undefined and errors are masked
  - With re-throw, original error propagates to caller for proper handling
- Successfully created test card in Trello via CLI

## 2025-01-23: Task 1.11 complete - Move a card (PUT request)

- Added `moveCard(cardId, targetListId)` function with PUT request
- Learned: PUT vs POST — PUT updates existing resources, POST creates new ones
- Learned: `URL.searchParams.set()` for building query strings
  - Safer than manual string concatenation with `?` and `&`
  - Handles URL encoding automatically (spaces, special chars, etc.)
  - Example: `url.searchParams.set('idList', targetListId)` adds `&idList=xyz` to URL
  - Can add multiple parameters by calling `.set()` multiple times
- API parameter precision matters: `idList` not `listId` — must match docs exactly
- Realized workflow friction: need board ID → list ID → card ID for operations
  - This is awkward for humans but normal for agents/APIs
  - Phase 2 (caching, defaults) solves human friction
  - Phase 4 (deployment) makes it accessible from anywhere
  - Phase 5 (LLM integration) lets Claude manage Trello autonomously

## 2025-01-23: Task 1.12 complete - Archive a card

- Added `archiveCard(cardId)` function with PUT request and `{closed: 'true'}` parameter
- Learned: Deep vs shallow modules (Ousterhout's philosophy)
  - Deep module: simple interface, hides complexity (archiveCard)
  - Shallow module: complex interface, exposes details (updateCard with params)
  - Chose archiveCard over generic updateCard — caller doesn't need to know about `closed` parameter
  - Follow the spec: task plan asked for archiveCard, not a generic function
- Refactored buildURL() during code review to accept optional params
  - Extended helper to eliminate code duplication in moveCard
  - Used `Object.entries()` and array destructuring in for loop
  - Pattern: `for (const [key, value] of Object.entries(params))`

## 2025-01-27: Task 1.13 complete - Error handling

- Created custom `TrelloApiError` class in `src/api/errors.ts`
  - Extends built-in `Error` class
  - Uses TypeScript constructor shorthand: `public statusCode: number` declares + assigns
  - `super(message)` passes message to parent Error class
- Refactored API client to throw structured errors, removed try/catch
  - Error handling happens in CLI layer, not API layer
  - Security: use `path` in error messages, not `url` (which contains credentials)
- Added try/catch to all CLI commands in index.ts
  - `instanceof TrelloApiError` checks type at runtime
  - `console.error()` writes to stderr (separate from stdout output)
  - `process.exit(1)` signals failure to shell
- Tested: bad input now shows `Error: Request to boards/abc123/lists failed (status 400)` instead of stack trace

## 2025-01-29: Task 1.14 complete - Better output formatting

- Installed chalk for terminal colors
- Learned `padEnd(width)` for aligning columns
  - Calculate max length of each column's data
  - Add padding (e.g., +4) for spacing between columns
  - Each column gets its own width
- Learned `?.` (optional chaining) — short-circuits to `undefined` if left side is null
- Learned `??` (nullish coalescing) — provides fallback when value is `null` or `undefined`
- Operator precedence gotcha: `value ?? fallback.method()` — method runs first!
  - Need parentheses: `(value ?? fallback).method()`
- Chalk + padEnd interaction: pad the string BEFORE coloring
  - Wrong: `chalk.white('NAME').padEnd(width)` — pads ANSI codes too
  - Right: `chalk.white('NAME'.padEnd(width))` — pads raw string, then colors

## 2025-01-30: Task 1.16 complete - Due date manipulation

- Added `--due` option to create-card command
- Created `setDue()` and `clearDue()` API functions
- Created `set-due` and `clear-due` CLI commands
- Learned: Commander `.option()` vs `.argument()`
  - `.argument()` = positional, order matters
  - `.option()` = named flag like `--due`, can appear anywhere
  - Options come as an object in the last callback parameter
- Learned: `param: string | undefined` vs `param?: string`
  - `param?` means "can omit when calling"
  - `param: T | undefined` means "always passed, but value might be undefined"
  - Commander always passes all args, so use the second form
- Ternary for conditional values: `due ? new Date(due).toISOString() : undefined`
- Trello accepts `due: 'null'` as a string to clear due dates

## 2025-01-31: Task 1.18a & 1.18b complete - TrelloService with Result pattern

- Created `Result<T>` type in `src/types/result.ts`
  - `Success<T> = { success: true, data: T }`
  - `Failure = { success: false, error: { code, message } }`
  - Union type: `Result<T> = Success<T> | Failure`
- Created `TrelloService` class in `src/services/trello-service.ts`
  - Constructor takes apiKey and token (dependency injection)
  - All methods return `Result<T>` instead of throwing
  - All methods use `safeParse` instead of `parse`
- **Why the service?** Bot needs to stay running on errors. CLI can crash, bot can't.
  - CLI uses client.ts with throws + try/catch
  - Bot will use TrelloService with Result pattern + `if (!result.success)` checks
- Learned: `import type` for type-only imports (types erased at compile time)
- Learned: Constructor shorthand `private param: type` declares + assigns class property
- Delegated: remaining service methods (mechanical repetition, pattern understood)

## 2025-02-01: Task 1.19 complete - Configuration file

- Created ConfigService in `src/services/config-service.ts`
- Config stored at `~/.ctx/config.json` with proper permissions (0o600)
- Added CLI commands: `config set-default-board`, `config set-default-list`, `config show`
- Modified `create-card` to use default inbox list when `--list` not provided
- Learned: Node.js fs APIs (readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync)
- Learned: `node:fs` prefix for built-in modules
- Learned: Commander subcommands pattern with `program.command('parent').command('child')`

## Phase 1 Complete

**Delivered:**
- Working CLI with 14 commands
- TrelloService with Result pattern (bot-ready)
- ConfigService with default board/list
- Zod validation on all API responses
- Proper error handling and exit codes
