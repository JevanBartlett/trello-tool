# Research Notes

## Progress Log

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
