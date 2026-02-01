# Research Notes

## Progress Log

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
- `Result<T>` pattern — returning `{ success: true, data }` or `{ success: false, error }` instead of throwing
- `safeParse` vs `parse` — safeParse returns result object, parse throws on failure
- Class constructor shorthand — `private param: type` in constructor declares + assigns property

## Bug Journal
When a meaningful bug occurs, log:
- Symptom
- Root cause  
- How I found it
- Prevention (test, lint rule, type, invariant)

**2025-01-04:** Project setup complete

- GitHub repo created: https://github.com/JevanBartlett/trello-tool
- SSH key configured for GitHub authentication (ed25519)
- Initial commit pushed with project scaffolding
- Tools configured: TypeScript, ESLint, Prettier, Husky (pre-commit hooks)

**2025-01-05:** Week 1 complete - First API calls working

- Task 1.2: Trello credentials stored in .env
- Task 1.3: First API call to /members/me successful (username: joshbartlett16)
- Task 1.4: Fetched all boards via /members/me/boards
- Installed dotenv package for loading .env
- Learned: ES modules + ts-node don't mix well; use `npm run build && npm start` instead
- Learned: ESLint strict mode flags `any` types from response.json() — use `unknown`

**2025-01-10:** Task 1.5 complete - API module refactored

- Created src/api/client.ts with buildURL(), getData(), getBoards(), getMe()
- Learned: URL constructor trailing slash matters for relative paths:
  - `new URL("path", "https://example.com/1")` → replaces `/1` with `path`
  - `new URL("path", "https://example.com/1/")` → appends `path` after `/1/`
- Added TRELLO_BASE_URL to .env (with trailing slash)
- Using `as` casts for now, but uncomfortable with it — next task is Zod validation
- Installed zod for runtime schema validation (Task 1.6)
- Next: Convert interfaces to Zod schemas, remove casts

**2025-01-19:** Tasks 1.6 & 1.7 complete - Zod validation and CLI structure

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

**2025-01-21:** Task 1.8 complete - Fetch lists for a board

- Added `getList(boardID)` function with parameterized endpoint `/boards/${boardID}/lists`
- Created `get-list <board-id>` command using Commander's `.argument('<name>')`
- Learned: Commander `.argument()` for positional args
  - `<name>` = required, `[name]` = optional
  - Value passed as first parameter to `.action()` callback
- Reinforced: `tsc` compiles, `tsx` compiles AND runs
  - `npx tsc src/index.ts get-list ...` fails because tsc treats args as file paths
  - `npx tsx src/index.ts get-list ...` works because tsx runs the program

**2025-01-22:** Task 1.9 complete - Fetch cards for a list

- Added `getCards(listID)` function to client.ts with endpoint `/lists/${listID}/cards`
- Created `get-cards <list-id>` command following same pattern as get-list
- Bug caught: Initially wrote `.command('get cards')` with space instead of hyphen
  - Commander interprets space as nested subcommand structure
  - Fixed to `.command('get-cards')` to match CLI convention
- Observation: Commands now inconsistent in naming (`boards` vs `get-user` vs `get-list` vs `get-cards`)
  - Will be addressed in Task 1.14/1.15 (formatting and help text)

**2025-01-22:** Task 1.10 complete - Create a card (first write operation)

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

**2025-01-23:** Task 1.11 complete - Move a card (PUT request)

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

**2025-01-23:** Task 1.12 complete - Archive a card

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

**2025-01-27:** Task 1.13 complete - Error handling

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

**2025-01-29:** Task 1.14 complete - Better output formatting

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

**2025-01-30:** Task 1.16 complete - Due date manipulation

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

**2025-01-31:** Task 1.18a & 1.18b complete - TrelloService with Result pattern

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

---

## Trello API Authentication

**API Key vs Token - Key Distinction:**

- **API Key** = Identifies your _application_ ("This request comes from Imran's Trello CLI tool")
- **Token** = Identifies the _user_ AND _permissions_ ("Imran authorized this app to read/write his boards")

You need BOTH to make requests. The token doesn't specify which board — it grants access to the user's account. Your code specifies which board in the API request.

**Where to get credentials:**

- API Key: https://trello.com/power-ups/admin
- Token: https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=YOUR_API_KEY

---

## Trello API Endpoints

**Base URL:** `https://api.trello.com/1`
**Auth:** Append `?key={apiKey}&token={token}` to all requests
**Docs:** https://developer.atlassian.com/cloud/trello/rest/

- Get current user: `GET /members/me`
- Get all boards for user: `GET /members/me/boards`
- Get lists on a board: `GET /boards/{boardId}/lists`
- Get cards on a list: `GET /lists/{listId}/cards`
- Create a card: `POST /cards` (with listId in body)

**Pattern observed:** Resources are nested (members → boards → lists → cards)

---

## Josh's Board Structure

**Board:** FCO UAT task list

**Lists (Kanban flow):**

1. FCO Tasks (backlog)
2. Follow Up
3. Doing
4. Done [DATE] (weekly, archived after review)
5. Blocked

**Card fields that matter:**

- Title (required)
- Description
- Due dates
- Labels/tags

**Workflow notes:**

- Done lists are archived weekly
- New Done list created each Monday with that week's date
- Archived lists are unarchived for reviews (broad strokes, not microtasks)

---

## CLI Design Decisions

**Subcommand style chosen:**

```bash
trello export --board "FCO UAT task list" --list "Doing"
trello create --list "FCO Tasks" --title "New task"
```

**Open questions:**

- Output to stdout or file? (leaning toward file)
- Include archived lists? (need `--include-archived` flag)
