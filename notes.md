# Research Notes

## Progress Log

## Concepts Solidified
- [emerges as we work]

## Still Working Through
- `tsc` vs `tsx` — when to use which, what each actually does under the hood

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
