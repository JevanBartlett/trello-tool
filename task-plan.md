Trello CLI Project — Task Plan
Purpose
This project exists to build fundamental software engineering skills through practical application. The goal is not the tool itself—it's the developer you become by building it.
Ground Rules

No planning beyond the current phase
Each task should result in runnable code
Commit after each completed task
When stuck for more than 30 minutes, ask for help
Ugly working code beats beautiful imaginary code

Phase 1: Consume the API
Skills: HTTP requests, data parsing, authentication, CLI basics
Week 1: First Contact

✅ Task 1.1: Set up project

Create directory, npm init, install TypeScript
Create tsconfig.json
Create src/index.ts that logs "Hello Trello"
Run it with npx ts-node src/index.ts
Done when: You see "Hello Trello" in terminal
**Completed:** Project scaffolded with TypeScript, ESLint, Prettier, Husky pre-commit hooks

✅ Task 1.2: Get Trello credentials

Go to https://trello.com/power-ups/admin
Create a new Power-Up (just to get API key)
Generate API key and token
Store in .env file (add .env to .gitignore)
Done when: You have TRELLO_API_KEY and TRELLO_TOKEN in .env
**Completed:** Credentials stored in .env, .gitignore already configured

✅ Task 1.3: First API call

Install dotenv and a fetch library (or use native fetch)
Make GET request to https://api.trello.com/1/members/me
Log the response
Done when: You see your Trello username printed
**Completed:** Using native fetch, dotenv installed, username 'joshbartlett16' returned

✅ Task 1.4: Fetch your boards

GET https://api.trello.com/1/members/me/boards
Parse response JSON
Print board names to console
Done when: Your board names appear in terminal
**Completed:** 10 boards returned including FCO UAT Task, Mom's Project, Shopping Lists

Week 2: Structure and CLI

✅ Task 1.5: Create a Trello API module

Move API logic to src/api/client.ts
Export functions: getMe(), getBoards()
Import and use from index.ts
Done when: Same output, cleaner code
**Completed:** buildURL() helper for auth, getData() for fetching, getBoards() and getMe() exported. Learned URL constructor trailing slash behavior.

✅ Task 1.6: Add Zod schema validation

Install zod
Convert interfaces in src/types/trello.ts to Zod schemas
Infer TypeScript types from schemas using z.infer
Validate API responses with .parse() instead of casting
Done when: API responses are validated at runtime, no more `as` casts
**Completed:** Zod schemas created for Board, Member, Label, List, Card. Types inferred with z.infer. API functions use .parse() for runtime validation.

✅ Task 1.7: Add basic CLI structure

Install commander
Create command: trello boards
Wire it to your getBoards() function
Done when: npx ts-node src/index.ts boards lists your boards
**Completed:** Commander installed, `boards` and `get-user` commands working. Fixed ESLint config for type-checked rules. Learned about tsx vs tsc build workflow.

✅ Task 1.8: Fetch lists for a board

Add getLists(boardId) function
Create command: trello lists <board-id>
Done when: You can see lists for any board
**Completed:** Added getList(boardID) function with parameterized endpoint. Created `get-list <board-id>` command using Commander's .argument() for positional args.

✅ Task 1.9: Fetch cards for a list

Add getCards(listId) function
Create command: trello cards <list-id>
Done when: You can see cards in any list
**Completed:** Added getCards(listID) function with parameterized endpoint. Created `get-cards <list-id>` command. Tested successfully with FCO UAT board.

Week 3: Write Operations

✅ Task 1.10: Create a card

Add createCard(listId, name, description?) function
Create command: trello add-card <list-id> "Card name"
Done when: Card appears in Trello UI
**Completed:** Added createCard() with POST request, JSON body, and Content-Type header. Created `create-card` command with three arguments (two required, one optional). Card successfully created in Trello.

✅ Task 1.11: Move a card

Add moveCard(cardId, targetListId) function
Create command: trello move-card <card-id> <list-id>
Done when: Card moves between lists
**Completed:** Added moveCard() with PUT request using URL.searchParams.set() to build query parameters. Created `move-card` command with two required arguments. Successfully tested moving cards between lists on FCO UAT board. Learned: PUT for updates vs POST for creates, searchParams.set() for building query strings safely.

✅ Task 1.12: Archive a card

Add archiveCard(cardId) function
Create command: trello archive-card <card-id>
Done when: Card is archived
**Completed:** Added archiveCard() with PUT request and {closed: 'true'} parameter. Created archive-card CLI command with one required argument. Successfully tested - archived card removed from active list view. Learned: Chose focused function (archiveCard) over generic updateCard for better interface clarity (deep modules principle).

Week 4: Polish

✅ Task 1.13: Error handling

Wrap API calls in try/catch
Display meaningful error messages
Handle network failures gracefully
Done when: Bad inputs show helpful errors, not stack traces
**Completed:** Created TrelloApiError custom class with statusCode and endpoint properties. API client throws structured errors. CLI catches errors and shows clean messages (no stack traces). Learned: custom error classes (extends Error, public constructor params), instanceof for type checking, process.exit(1) for signaling failure, console.error for stderr.

Task 1.14: Better output formatting

Format boards/lists/cards in readable columns
Add colors with chalk (optional)
Show IDs in a way that's easy to copy
Done when: Output is pleasant to read

Task 1.15: Add help text

Add descriptions to all commands
trello --help shows useful info
Done when: A stranger could figure out how to use it

Phase 1 Complete Checkpoint: You have a working CLI that can read and write to Trello.

Phase 2: Persist Data
Skills: Local storage, caching, configuration management
Week 5: Local Storage

Task 2.1: Store config in a file

Create ~/.trello-cli/config.json
Store default board ID
Command: trello config set-default-board <board-id>
Done when: Default persists across sessions

Task 2.2: Cache boards and lists

Save boards/lists to ~/.trello-cli/cache.json
Add timestamps to cached data
Done when: Second trello boards is instant

Task 2.3: Cache invalidation

Add --refresh flag to bypass cache
Auto-expire cache after 5 minutes
Done when: trello boards --refresh fetches fresh data

Task 2.4: Use default board

trello lists (no arg) uses default board
trello add-card "Name" uses default board's first list
Done when: Common operations require fewer arguments

Week 6: SQLite (Optional but Recommended)

Task 2.5: Set up SQLite

Install better-sqlite3
Create database at ~/.trello-cli/data.db
Create tables: boards, lists, cards
Done when: Database file exists with tables

Task 2.6: Migrate caching to SQLite

Replace JSON cache with database queries
Insert/update on fetch
Query from database for display
Done when: Same behavior, database backend

Task 2.7: Add local search

Command: trello search "keyword"
Search card names and descriptions locally
Done when: Search returns matching cards instantly

Phase 2 Complete Checkpoint: Your CLI is faster and remembers preferences.

Phase 3: Expose Your Own API
Skills: HTTP server, routing, request/response handling, API design
Week 7: Basic Server

Task 3.1: Hello World server

Install express and @types/express
Create src/server.ts
GET / returns { status: "ok" }
Done when: curl http://localhost:3000 returns JSON

Task 3.2: Boards endpoint

GET /boards returns your boards
Reuse your existing getBoards() function
Done when: Browser shows your boards as JSON

Task 3.3: Lists endpoint

GET /boards/:boardId/lists returns lists
Handle invalid board ID with 404
Done when: Endpoint works, errors are handled

Task 3.4: Cards endpoints

GET /lists/:listId/cards
POST /lists/:listId/cards (body: { name, description })
Done when: Can read and create cards via HTTP

Week 8: API Completeness

Task 3.5: Card operations

PUT /cards/:cardId/move (body: { listId })
DELETE /cards/:cardId
Done when: Full CRUD for cards via API

Task 3.6: Input validation

Validate request bodies
Return 400 with helpful messages for bad input
Done when: POST /cards with no name returns clear error

Task 3.7: Consistent error responses

All errors return { error: string, code: number }
Log errors server-side
Done when: Errors are predictable and logged

Task 3.8: Add authentication

Require Authorization: Bearer <token> header
Generate a personal token, store in config
Reject unauthorized requests with 401
Done when: API is protected

Week 9: Documentation and Testing

Task 3.9: Document your API

Create API.md with all endpoints
Include example requests/responses
Done when: Someone else could use your API from docs alone

Task 3.10: Add basic tests

Install testing framework (vitest or jest)
Test at least 3 endpoints
Done when: npm test passes

Phase 3 Complete Checkpoint: You have an API that any client (including an LLM) can call.

Phase 4: Deploy It
Skills: Deployment, environment management, production concerns
Week 10: Prepare for Production

Task 4.1: Environment configuration

Use environment variables for all secrets
Create .env.example documenting required vars
Done when: App runs with only env vars, no hardcoded secrets

Task 4.2: Add health check

GET /health returns { status: "healthy", timestamp }
Done when: Monitoring can ping your app

Task 4.3: Add request logging

Log each request: method, path, status, duration
Done when: You can see traffic in logs

Task 4.4: Dockerfile

Create Dockerfile for your app
Build and run locally with Docker
Done when: docker run starts your server

Week 11: Deploy

Task 4.5: Choose and set up platform

Fly.io recommended (free tier, simple)
Install CLI, authenticate
Done when: fly auth whoami shows your account

Task 4.6: First deploy

fly launch to configure
Set secrets with fly secrets set
Deploy
Done when: Your API is live on the internet

Task 4.7: Verify production

Hit your live /health endpoint
Create a card via live API
Verify it appears in Trello
Done when: Full round trip works in production

Task 4.8: Set up basic monitoring

Check Fly.io dashboard for logs
Understand where to look when things break
Done when: You can find logs and metrics

Phase 4 Complete Checkpoint: Your API is live and reachable from anywhere.

Phase 5: Integration
Skills: System integration, debugging distributed systems
Week 12: LLM Integration

Task 5.1: Define tool schema

Write JSON schema for your API (for LLM function calling)
Document what each tool does
Done when: Schema matches your endpoints

Task 5.2: Test with Claude

Use your deployed API as a tool
Ask Claude to list your boards, create a card
Done when: Claude successfully uses your API

Task 5.3: Debug a real issue

Something will break. Find it. Fix it.
Document what went wrong and how you found it
Done when: You've solved a real production issue

# Task Plan — Personal Automation CLI + MCP Server

**Working name:** `ctx`  
> You're no longer building a Trello-only CLI. Namespace commands: `ctx trello …`, `ctx google …`, `ctx gmail …`, `ctx notes …`

---

## Global Non-Negotiables (apply to all phases)

### Security
- Token files & configs stored under `~/.ctx/`
- All secrets files: `chmod 600`
- No tokens in logs. Ever.
- Default mode for "agent writes" is **append-only** unless explicitly enabled.

### Observability
- Every tool invocation logged:
  - timestamp, actor (cli/api/mcp), operation, target, success/failure, error msg
- Structured error format everywhere:
  - `{ success: false, code, message, hint, details? }`

### Timezones
- CLI inputs interpreted in **local timezone** by default.
- Outbound requests use RFC3339 with explicit timezone offsets.

---

# Phase 6: Google Calendar Integration
**Skills:** OAuth2 (Installed App), token refresh, timezone policy, Google APIs

## Week 13: OAuth2 Foundation

### Task 6.1 — Google Cloud Setup (Installed App)
- Create project in Google Cloud Console
- Enable **Google Calendar API**
- Configure consent screen
- Create OAuth2 credentials as **Desktop / Installed App**
- Done when:
  - You have credentials downloaded as JSON
  - You've configured redirect support for loopback localhost flow

### Task 6.2 — Implement OAuth2 loopback flow
- Install `googleapis`
- Create `src/auth/google.ts`
- Implement:
  - Authorization URL generation with:
    - `access_type=offline`
    - `prompt=consent` (first-time auth to ensure refresh token)
  - Local callback server (loopback redirect)
  - Exchange code -> tokens
- Done when:
  - You can get an access token via browser flow
  - You have a refresh token (first-time flow)

### Task 6.3 — Token persistence + refresh
- Save tokens to `~/.ctx/google-tokens.json`
- Enforce `chmod 600`
- Implement automatic refresh on expiry
- Done when:
  - Tokens persist across sessions
  - Refresh happens without user intervention

### Task 6.4 — CLI auth command
- `ctx google login`
- Opens browser, handles callback via local server
- Done when:
  - User can authenticate with one command end-to-end

## Week 14: Calendar Read Operations

### Task 6.5 — List calendars
- Add `getCalendars()` in `src/api/google-calendar.ts`
- CLI: `ctx google calendars`
- Done when:
  - Calendars appear with `id`, `summary`, `primary?`

### Task 6.6 — Get events (with timezone policy)
- Add `getEvents(calendarId, timeMin, timeMax)`
- CLI: `ctx google events [calendar-id] --from <date> --to <date>`
- Print local times by default
- Done when:
  - Events display with correct local times vs Calendar UI

### Task 6.7 — Search events
- Add `searchEvents(query, timeMin?, timeMax?)`
- CLI: `ctx google events-search "keyword" [--from] [--to]`
- Done when:
  - Can find events by text search reliably

## Week 15: Calendar Write Operations

### Task 6.8 — Create event
- Add `createEvent(calendarId, event)`
- CLI: `ctx google add-event "Title" --date <date> --time <time> --duration <minutes> [--location] [--notes]`
- Done when:
  - Event appears in Google Calendar and can be fetched by your CLI

### Task 6.9 — Update event
- Add `updateEvent(calendarId, eventId, updates)`
- CLI: `ctx google update-event <event-id> [--title] [--date] [--time] [--duration]`
- Done when:
  - Can modify existing events without clobbering other fields

### Task 6.10 — Delete event
- Add `deleteEvent(calendarId, eventId)`
- CLI: `ctx google delete-event <event-id>`
- Done when:
  - Events can be removed and disappear from subsequent fetches

## Week 16: Calendar Polish

### Task 6.11 — Default calendar config
- Add default calendar to config file
- Commands work without specifying calendar ID
- Done when:
  - `ctx google events --from --to` uses default calendar

### Task 6.12 — Recurring events
- Step 1: Display RRULE and recurrence info
- Step 2: Create "simple weekly" recurrence
- Done when:
  - You can create weekly/monthly recurring events and display recurrence info

### Task 6.13 — Add calendar endpoints to REST API
- GET `/calendars`
- GET `/calendars/:id/events`
- POST `/calendars/:id/events`
- PUT `/events/:id`
- DELETE `/events/:id`
- Done when:
  - Full calendar CRUD via HTTP with consistent errors/logging

**Phase 6 Complete Checkpoint:** You can manage Google Calendar from CLI and API.

---

# Phase 7: Gmail Integration
**Skills:** Gmail API, MIME/RFC 2822, threading headers, search operators

## Week 17: Gmail Auth & Reading

### Task 7.1 — Enable Gmail API + incremental scopes
- Enable Gmail API in Google Cloud
- Add Gmail scope(s) to OAuth flow
- Force re-auth to grant Gmail permissions
- Done when:
  - Token has Gmail access (verified by calling an endpoint)

### Task 7.2 — List messages
- Add `getMessages(query, maxResults, pageToken?)` in `src/api/gmail.ts`
- CLI: `ctx gmail emails [--from] [--subject] [--unread] [--max N]`
- Done when:
  - Can list recent emails with filters + pagination

### Task 7.3 — Read message (MIME parsing)
- Add `getMessage(messageId)`
- Parse plain text + HTML parts
- CLI: `ctx gmail email <message-id>`
- Done when:
  - Can read full email content reliably

### Task 7.4 — Search emails (Gmail operators)
- Implement raw Gmail search operators
- CLI: `ctx gmail search "from:boss subject:(uat) newer_than:7d"`
- Done when:
  - Can use Gmail-style search from CLI

## Week 18: Gmail Write Ops

### Task 7.5 — Send email (RFC 2822 raw)
- Add `sendEmail(to, subject, body)`
- Build RFC 2822 message, base64url encode, send via Gmail
- CLI: `ctx gmail send <to> --subject "Subject" --body "Body"`
- Done when:
  - Can send plain text emails that arrive correctly

### Task 7.6 — Reply to email (thread correctly)
- Add `replyToEmail(messageId, body)`
- MUST set:
  - `threadId`
  - RFC 2822 headers: `In-Reply-To`, `References`
- CLI: `ctx gmail reply <message-id> --body "Reply"`
- Done when:
  - Replies thread correctly in Gmail

### Task 7.7 — Drafts
- Add `createDraft()`, `getDrafts()`, `sendDraft()`
- CLI: `ctx gmail drafts`, `ctx gmail create-draft`, `ctx gmail send-draft <draft-id>`
- Done when:
  - Can manage drafts from CLI

## Week 19: Gmail Polish

### Task 7.8 — Labels
- Add `getLabels()`, `addLabel()`, `removeLabel()`
- CLI: `ctx gmail label <message-id> <label>`
- Done when:
  - Can organize emails with labels

### Task 7.9 — Attachments
- Handle attachment downloads in `getMessage()`
- Save to local directory
- CLI: `ctx gmail email <message-id> --save-attachments [--out ./attachments]`
- Done when:
  - Can download email attachments reliably

### Task 7.10 — Gmail REST endpoints
- GET `/emails`
- GET `/emails/:id`
- POST `/emails/send`
- POST `/emails/:id/reply`
- Done when:
  - Email operations available via HTTP

**Phase 7 Complete Checkpoint:** You can read and send email from CLI and API.

---

# Phase 8: Notes Gateway (File-First Vault + Always-On Agent Access)
**Skills:** File IO, indexing/search, append-only writing, conflict handling, auth, audit logs

## Hosting Decision (Choose Before Starting)

The Notes Gateway runs 24/7. You have two options:

### Option A: Cloud Container (Recommended for you)
- Deploy to Fly.io, Railway, or Render (free/cheap tiers available)
- Same Docker skills from Phase 4
- Requires solving vault sync (see Task 8.1)

### Option B: Home Server
- Mac mini / Linux mini PC / NAS
- No sync needed—vault is local
- Requires hardware, networking, maintenance

**Recommendation:** Start with Option A. You're already learning Docker. Add home server later if cloud limits frustrate you.

---

## Week 20: Vault + Gateway Foundations

### Task 8.1 — Vault location + sync strategy
Choose one:

**Option 1: Git-based sync (recommended)**
- Vault is a Git repo
- Container clones repo, pulls before reads, commits+pushes after writes
- You get version history for free
- Edit locally, push; container pulls latest

**Option 2: Cloud storage mount**
- Vault in Dropbox/Google Drive
- Container mounts via rclone or similar
- More fragile, sync conflicts possible

**Option 3: Vault lives in container only**
- No local Obsidian editing
- All edits via API or web UI
- Simplest architecture, worst UX

Done when:
- You've chosen an approach and documented it
- Vault folder exists with structure: `Daily/`, `Projects/`, `People/`, `Inbox/`
- README in vault root explains conventions

### Task 8.2 — Notes Gateway service scaffold
- Create `src/notes-gateway/server.ts`
- Add REST auth (API key header)
- Add audit log file: `~/.ctx/audit.log` (or container-appropriate path)
- Done when:
  - Server runs and requires API key
  - Requests log to audit file

### Task 8.3 — Core note operations (append-first)
Implement:
- `createNote(path, title?, content?)`
- `getNote(path)`
- `appendToNote(path, content, heading?)`
- `listNotes(prefixPath?)`

Done when:
- You can create/read/append/list without data loss
- Append does NOT rewrite existing content

## Week 21: Search + Safety

### Task 8.4 — Fast search
- Implement search via `ripgrep` (shell) or Node equivalent
- Endpoint: `GET /notes/search?q=...`
- Done when:
  - Search returns results with file + line snippets quickly

### Task 8.5 — Safety guardrails
- Allowlist vault root (no path traversal)
- Hard limit note size and append size
- Optional denylist patterns (e.g., never expose `Banking/`, `Medical/`)
- Done when:
  - Attempts to access outside vault fail safely
  - Sensitive folders are protected

### Task 8.6 — Conflict strategy (if using sync)
- If vault is synced (Git/cloud), define behavior:
  - Git: pull before read, commit+push after write
  - If conflict detected -> write to `Conflicts/` + log
- Done when:
  - Conflicts don't silently destroy content

## Week 22: Agent-Friendly Features

### Task 8.7 — Templates for agent output
- Standard sections:
  - `## Agent Findings`
  - `## Decisions`
  - `## Next Actions`
- Endpoint supports `heading="Agent Findings"` for targeted append
- Done when:
  - Agents always append into predictable sections

### Task 8.8 — Optional: embeddings index
- Create local vector index (lightweight, e.g., using sqlite-vss)
- Endpoint: `GET /notes/semantic?q=...`
- Skip if not needed—ripgrep may be enough
- Done when:
  - Semantic search works without shipping data to external services

### Task 8.9 — Notes REST API completeness
- GET `/notes` — list notes
- GET `/notes/:path` — read note
- POST `/notes` — create note
- PATCH `/notes/:path/append` — append to note
- GET `/notes/search` — text search
- Done when:
  - Notes fully manageable via HTTP with safe defaults

### Task 8.10 — Obsidian integration (optional)
- Use Obsidian as UI on top of vault folder (if using Git sync)
- Gateway and Obsidian both read/write same Markdown files
- Done when:
  - You can edit notes in Obsidian while agents use the gateway

**Phase 8 Complete Checkpoint:** You have an always-on service that safely exposes your Markdown vault to agents.

---

# Phase 9: Playwright Action Primitives
**Skills:** Browser automation, selector strategies, error recovery, action abstraction

## Week 23: Playwright Foundation

### Task 9.1 — Set up Playwright module
- Create `src/browser/index.ts`
- Initialize browser instance management
- Handle headless/headed modes
- Done when:
  - Can launch and close browser programmatically

### Task 9.2 — Navigation primitives
- `goToUrl(url)` — navigate and wait for load
- `getCurrentUrl()` — return current URL
- `goBack()`, `goForward()`, `refresh()`
- Done when:
  - Basic navigation works reliably

### Task 9.3 — Page reading primitives
- `getPageText()` — extract visible text
- `getPageTitle()` — return title
- `screenshot()` — capture current state
- `getElementText(selector)` — text from specific element
- Done when:
  - Can extract information from pages

## Week 24: Interaction Primitives

### Task 9.4 — Click and type
- `click(selector)` — click element with auto-wait
- `type(selector, text)` — type into input
- `clear(selector)` — clear input field
- `pressKey(key)` — keyboard actions
- Done when:
  - Basic interactions work with proper waiting

### Task 9.5 — Form handling
- `fillForm(fields)` — fill multiple fields at once
- `selectOption(selector, value)` — dropdowns
- `checkBox(selector, checked)` — checkboxes
- `submitForm(selector?)` — submit form
- Done when:
  - Can fill and submit arbitrary forms

### Task 9.6 — Waiting strategies
- `waitForElement(selector, options)` — wait for element
- `waitForNavigation()` — wait for page load
- `waitForText(text)` — wait for text to appear
- `waitForNetworkIdle()` — wait for requests to settle
- Done when:
  - Robust waiting for dynamic pages

## Week 25: Advanced Primitives

### Task 9.7 — Data extraction
- `extractTable(selector)` — table to JSON
- `extractLinks(selector?)` — all links on page
- `extractStructuredData(schema)` — extract data matching schema
- Done when:
  - Can pull structured data from pages

### Task 9.8 — Error handling and recovery
- Wrap all primitives in try/catch
- Return structured results: `{ success, data?, error?, screenshotPath? }`
- Auto-screenshot on failure
- Done when:
  - Failures are informative, not crashes

### Task 9.9 — Session management
- `saveCookies(path)`, `loadCookies(path)`
- Handle login persistence
- Done when:
  - Can maintain logged-in sessions

## Week 26: Playwright API Layer

### Task 9.10 — CLI commands for browser
- `ctx browser open <url>` — open and screenshot
- `ctx browser text <url>` — extract text
- `ctx browser form <url> --data '{...}'` — fill form
- Done when:
  - Browser actions available from CLI

### Task 9.11 — REST endpoints for browser
- POST `/browser/navigate` `{ url }`
- GET `/browser/screenshot`
- POST `/browser/click` `{ selector }`
- POST `/browser/type` `{ selector, text }`
- POST `/browser/form` `{ url, fields }`
- POST `/browser/extract` `{ url, schema }`
- Done when:
  - Browser automation available via HTTP

### Task 9.12 — Safety guardrails
- URL allowlist/blocklist configuration
- Timeout limits on all operations
- No access to sensitive domains by default (banks, medical portals, etc.)
- Done when:
  - Playwright can't accidentally access dangerous sites

**Phase 9 Complete Checkpoint:** You have browser automation primitives any client can invoke safely.

---

# Phase 10: MCP Compliance
**Skills:** Protocol implementation, tool schema design, context management

## Week 27: MCP Foundation

### Task 10.1 — Study MCP spec + choose stable SDK
- Read Anthropic's MCP documentation thoroughly
- Pin **v1.x** of MCP SDK until v2 stabilizes
- Done when:
  - Can explain MCP handshake and tool invocation flow

### Task 10.2 — MCP server scaffold
- Install MCP SDK (`@modelcontextprotocol/sdk` or equivalent)
- Create `src/mcp/server.ts`
- Implement discovery endpoint
- Done when:
  - MCP client can connect and list tools (even if empty)

### Task 10.3 — Tool schemas (grouped by domain)
- Trello tools
- Calendar tools
- Gmail tools
- Notes Gateway tools
- Browser tools
- Done when:
  - Schema file covers all operations with params, returns, examples

## Week 28: Tool Migration

### Task 10.4 — Trello tools via MCP
- Wrap existing Trello functions as MCP tools
- Done when:
  - LLM can list boards, create/move/archive cards via MCP

### Task 10.5 — Calendar tools via MCP
- Wrap Google Calendar functions as MCP tools
- Done when:
  - LLM can list calendars, read/create events via MCP

### Task 10.6 — Gmail tools via MCP
- Wrap Gmail functions as MCP tools
- Done when:
  - LLM can search/read/send email via MCP

### Task 10.7 — Notes tools via MCP (append-first)
- Expose only safe defaults:
  - `notes.search`
  - `notes.get`
  - `notes.create`
  - `notes.append` (no full rewrite by default)
- Done when:
  - LLM can manage notes without destructive edits

### Task 10.8 — Browser tools via MCP (guardrailed)
- Expose Playwright primitives with safety checks
- Done when:
  - LLM can automate allowed URLs safely

## Week 29: Context + Polish

### Task 10.9 — Context injection
- Provide useful defaults on connection:
  - Default board/calendar/notebook IDs
  - Common note paths (Inbox, Daily)
  - User timezone
- Done when:
  - LLM has helpful context without oversharing

### Task 10.10 — Error standardization
- One error format across all MCP tools
- Errors include actionable information
- Done when:
  - Failures are consistent and debuggable

### Task 10.11 — Logging + observability
- Log all tool invocations with timestamps
- Track success/failure rates
- Done when:
  - You can audit what the LLM did

### Task 10.12 — End-to-end workflow testing
Test multi-tool workflows:
- "Create calendar event, then append prep checklist to Daily note"
- "Search email, extract action items, create Trello card"
- "Check website, summarize findings, email summary to self"
- Done when:
  - Complex workflows complete reliably

**Phase 10 Complete Checkpoint:** You have a fully MCP-compliant personal automation server.

---

# Project Complete

## What You've Built
A personal MCP server exposing:
- **Trello** — task management
- **Google Calendar** — scheduling
- **Gmail** — communication
- **Notes Gateway** — knowledge/notes (Markdown files you own)
- **Playwright** — browser automation

Any MCP-compliant LLM can orchestrate your digital life.

## What You've Learned
- HTTP client and server development
- OAuth2 and API authentication
- Database persistence and caching
- File-based data management
- Protocol implementation (MCP)
- Browser automation
- Deployment and containerization
- Security practices (token handling, audit logs, guardrails)
- Error handling and observability
- API design and documentation

## Timeline
| Phases | Weeks |
|--------|-------|
| 1-5 (Trello CLI + API + Deploy) | ~15 |
| 6-10 (Calendar, Gmail, Notes, Playwright, MCP) | ~17 |
| **Total** | **~32 weeks** |

With life friction (family, work chaos, energy dips): **40-45 weeks**. Under a year.

## Maintenance Notes
- Keep dependencies pinned; upgrade intentionally
- Back up `~/.ctx/` (configs, tokens, audit logs)
- Back up your notes vault (Git handles this if you chose Option 1)
- Review safety allowlist/denylist quarterly
- Rotate API keys periodically
- Monitor for Google API deprecations
- The learning doesn't stop—extend as your needs evolve