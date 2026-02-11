# ctx — Personal Automation System

## Purpose

This project exists to build fundamental software engineering skills through practical application, while solving a real problem: **capture thoughts in 5-second windows during back-to-back meetings and route them to the right system without thinking about formatting.**

**The constraint:** You're in 6 hours of 30-minute calls daily. You have an iPad on cellular (grey zone, but it's how you survive). You need to thumb-mash a thought and move on.

**The solution:** Text anything to a Telegram bot. LLM parses intent. Services execute.

```
You (2:47pm): "nancy thursday uat"
Bot (2:47pm): ✓ task: follow up with Nancy about UAT — due Thursday

You (3:12pm): "routing broken again check with dev"  
Bot (3:12pm): ✓ note added to daily
```

---

## Ground Rules

- No planning beyond the current phase
- Each task should result in runnable code
- Commit after each completed task
- When stuck for more than 30 minutes, ask for help
- Ugly working code beats beautiful imaginary code

---

## Potential Updates (Short-Term Hardening)

- Add CLI startup validation for `TRELLO_API_KEY`, `TRELLO_TOKEN`, and `TRELLO_BASE_URL` with friendly errors.
- Guard empty-result formatting in `get-boards`, `get-lists`, and `get-cards` (avoid `Math.max()` on empty arrays).
- ✓ Validate due-date inputs before `toISOString()`; surface helpful errors on invalid dates.
- ✓ Make Obsidian daily append resilient if `## Captured` marker is missing (fallback to append or insert at end).
- Add a minimal README with env vars and example commands.

---

## Global Non-Negotiables

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

### Cost Awareness
- Claude API calls are cheap but not free
- Log token usage so you can monitor spend
- Target: < $5/month at normal usage

---

# Phase 1: Trello Foundation

**Skills:** HTTP requests, data parsing, authentication, CLI basics, service extraction

## Week 1: First Contact

### ✅ Task 1.1: Set up project

- Create directory, npm init, install TypeScript
- Create tsconfig.json
- Create src/index.ts that logs "Hello Trello"
- Run it with npx ts-node src/index.ts

**Done when:** You see "Hello Trello" in terminal

**Completed:** Project scaffolded with TypeScript, ESLint, Prettier, Husky pre-commit hooks

---

### ✅ Task 1.2: Get Trello credentials

- Go to https://trello.com/power-ups/admin
- Create a new Power-Up (just to get API key)
- Generate API key and token
- Store in .env file (add .env to .gitignore)

**Done when:** You have TRELLO_API_KEY and TRELLO_TOKEN in .env

**Completed:** Credentials stored in .env, .gitignore already configured

---

### ✅ Task 1.3: First API call

- Install dotenv and a fetch library (or use native fetch)
- Make GET request to https://api.trello.com/1/members/me
- Log the response

**Done when:** You see your Trello username printed

**Completed:** Using native fetch, dotenv installed, username 'joshbartlett16' returned

---

### ✅ Task 1.4: Fetch your boards

- GET https://api.trello.com/1/members/me/boards
- Parse response JSON
- Print board names to console

**Done when:** Your board names appear in terminal

**Completed:** 10 boards returned including FCO UAT Task, Mom's Project, Shopping Lists

---

## Week 2: Structure and CLI

### ✅ Task 1.5: Create a Trello API module

- Move API logic to src/api/client.ts
- Export functions: getMe(), getBoards()
- Import and use from index.ts

**Done when:** Same output, cleaner code

**Completed:** buildURL() helper for auth, getData() for fetching, getBoards() and getMe() exported. Learned URL constructor trailing slash behavior.

---

### ✅ Task 1.6: Add Zod schema validation

- Install zod
- Convert interfaces in src/types/trello.ts to Zod schemas
- Infer TypeScript types from schemas using z.infer
- Validate API responses with .parse() instead of casting

**Done when:** API responses are validated at runtime, no more `as` casts

**Completed:** Zod schemas created for Board, Member, Label, List, Card. Types inferred with z.infer. API functions use .parse() for runtime validation.

---

### ✅ Task 1.7: Add basic CLI structure

- Install commander
- Create command: trello boards
- Wire it to your getBoards() function

**Done when:** npx ts-node src/index.ts boards lists your boards

**Completed:** Commander installed, `boards` and `get-user` commands working. Fixed ESLint config for type-checked rules. Learned about tsx vs tsc build workflow.

---

### ✅ Task 1.8: Fetch lists for a board

- Add getLists(boardId) function
- Create command: trello lists <board-id>

**Done when:** You can see lists for any board

**Completed:** Added getList(boardID) function with parameterized endpoint. Created `get-list <board-id>` command using Commander's .argument() for positional args.

---

### ✅ Task 1.9: Fetch cards for a list

- Add getCards(listId) function
- Create command: trello cards <list-id>

**Done when:** You can see cards in any list

**Completed:** Added getCards(listID) function with parameterized endpoint. Created `get-cards <list-id>` command. Tested successfully with FCO UAT board.

---

## Week 3: Write Operations

### ✅ Task 1.10: Create a card

- Add createCard(listId, name, description?) function
- Create command: trello add-card <list-id> "Card name"

**Done when:** Card appears in Trello UI

**Completed:** Added createCard() with POST request, JSON body, and Content-Type header. Created `create-card` command with three arguments (two required, one optional). Card successfully created in Trello.

---

### ✅ Task 1.11: Move a card

- Add moveCard(cardId, targetListId) function
- Create command: trello move-card <card-id> <list-id>

**Done when:** Card moves between lists

**Completed:** Added moveCard() with PUT request using URL.searchParams.set() to build query parameters. Created `move-card` command with two required arguments. Successfully tested moving cards between lists on FCO UAT board. Learned: PUT for updates vs POST for creates, searchParams.set() for building query strings safely.

---

### ✅ Task 1.12: Archive a card

- Add archiveCard(cardId) function
- Create command: trello archive-card <card-id>

**Done when:** Card is archived

**Completed:** Added archiveCard() with PUT request and {closed: 'true'} parameter. Created archive-card CLI command with one required argument. Successfully tested - archived card removed from active list view. Learned: Chose focused function (archiveCard) over generic updateCard for better interface clarity (deep modules principle).

---

## Week 4: Polish

### ✅ Task 1.13: Error handling

- Wrap API calls in try/catch
- Display meaningful error messages
- Handle network failures gracefully

**Done when:** Bad inputs show helpful errors, not stack traces

**Completed:** Created TrelloApiError custom class with statusCode and endpoint properties. API client throws structured errors. CLI catches errors and shows clean messages (no stack traces). Learned: custom error classes (extends Error, public constructor params), instanceof for type checking, process.exit(1) for signaling failure, console.error for stderr.

---

### ✅ Task 1.14: Better output formatting

- Format boards/lists/cards in readable columns
- Add colors with chalk (optional)
- Show IDs in a way that's easy to copy

**Done when:** Output is pleasant to read

**Completed:** Added chalk for colors. Read commands display formatted columns with headers. Write commands show clean success messages with card name and ID. Learned: `padEnd()` for column alignment, `?.` optional chaining, `??` nullish coalescing, operator precedence with `??`.

---

### ✅ Task 1.15: Due date manipulation

- Add `--due` option to create-card command
- Add `set-due` command to update due date on existing card
- Add `clear-due` command to remove due date

**Done when:** Can create cards with due dates and modify due dates on existing cards

**Completed:** Added --due option to create-card using Commander .option(). Created setDue() and clearDue() API functions with PUT requests. Added set-due and clear-due CLI commands. Learned: Commander .option() vs .argument(), options object as last callback parameter, `param: string | undefined` vs `param?: string` for function signatures.

---

### ✅ Task 1.16: Update card description

- Add `set-desc` command to update description on existing card
- `ctx trello set-desc <card-id> "new description"`

**Done when:** Can update card descriptions from CLI

**Completed:** Added setDesc() to TrelloService and set-desc CLI command.

---

### ✅ Task 1.17: Add help text

- Add descriptions to all commands
- `trello --help` shows useful info

**Done when:** A stranger could figure out how to use it

**Completed:** All commands have .description() calls. Help text shows usage.

---

#### ✅ Task 1.18: Extract TrelloService

**This is the critical refactor.** Create the service layer that both CLI and future bot will use.

#### Subtasks

- [x] **1.18a:** Define `Result<T>` type in `src/types/result.ts`
- [x] **1.18b:** Create `TrelloService` class in `src/services/trello-service.ts`
  - All methods use `safeParse` instead of `parse`
  - All methods return `Result<T>` instead of throwing
  - Constructor takes `apiKey` and `token`
- [x] **1.18c:** Refactor all CLI commands to use service and handle success/failure

**TrelloService interface:**
```typescript
export class TrelloService {
  constructor(private apiKey: string, private token: string) {}
  
  async getBoards(): Promise<Result<Board[]>>
  async getLists(boardId: string): Promise<Result<List[]>>
  async getCards(listId: string): Promise<Result<Card[]>>
  async createCard(params: CreateCardParams): Promise<Result<Card>>
  async updateCard(id: string, params: UpdateCardParams): Promise<Result<Card>>
  async moveCard(id: string, targetListId: string): Promise<Result<Card>>
  async archiveCard(id: string): Promise<Result<void>>
  async setDue(id: string, dueDate: string): Promise<Result<Card>>
  async clearDue(id: string): Promise<Result<Card>>
}
```

**Done when:**

- All existing CLI commands work identically
- No `parse()` calls remain in service layer
- No fetch calls remain in command files
- Bad API responses produce clean errors, not stack traces
- Service is importable by other modules

**Time estimate:** 3-4 hours
---

### ✅ Task 1.19: Configuration file

- Create `~/.ctx/config.json`
- Store default board ID and inbox list ID
- `ctx trello config set-board <board-id>`
- `ctx trello config set-inbox <list-id>`

**Done when:**
- `trelloService.createCard({ name: "test" })` uses default inbox list
- Config persists across sessions

**Completed:** Created ConfigService with Zod validation, proper file permissions. Added config subcommands (set-default-board, set-default-list, show). Modified create-card to use --list option with fallback to configured default inbox.

---

**Phase 1 Complete Checkpoint:** You have a working CLI with a clean service layer that can be consumed by both humans and bots.

---

# Phase 2: Obsidian Foundation

**Goal:** Write to your Obsidian vault programmatically.

### ✅ Task 2.1: ObsidianService scaffold

**Create `src/services/obsidian-service.ts`:**
```typescript
export class ObsidianService {
  constructor(private vaultPath: string) {}
  
  async getDailyNotePath(): Promise<string>  // e.g., Daily/2025-01-31.md
  async appendToDaily(content: string): Promise<void>
  async createNote(path: string, content: string): Promise<void>
  async readNote(path: string): Promise<string>
  async searchNotes(query: string): Promise<SearchResult[]>
}
```

**Done when:**
- Can append a line to today's daily note
- Creates the daily note if it doesn't exist

**Time estimate:** 2 hours

**Completed:** ObsidianService created with getDailyNotePath(), appendToDaily(), createNote(), readNote(). Uses fs.promises for async file I/O, path.dirname() + mkdir() to ensure Daily folder exists.

---

### ✅ Task 2.2: Daily note conventions

Establish the format your daily notes will use:

```markdown
# 2025-01-31

## Captured
- 2:47pm — nancy thursday uat
- 3:12pm — routing broken again check with dev

## Tasks Created
- [ ] follow up with Nancy about UAT — due Thursday

## Notes
- routing issue resurfaced, check with dev team
```

**Done when:**
- `appendToDaily()` adds timestamped entry to Captured section
- Template creates proper structure for new daily notes

**Time estimate:** 1 hour

**Completed:** Created `getDailyTemplate()` for markdown structure, `formatTime()` for "2:47pm" format. Rewrote `appendToDaily()` to check if file exists (ENOENT pattern), create from template if not, insert timestamped entries after `## Captured\n`. Learned: nested try/catch for specific error handling, `indexOf()` + `slice()` for string insertion, variable shadowing pitfall.

---

### ✅ Task 2.3: Obsidian CLI commands

- `ctx notes daily` — show today's daily note
- `ctx notes append "some text"` — append to daily
- `ctx notes create <path> "content"` — create note
- `ctx notes search "query"` — search vault

**Done when:** Can manage notes from command line

**Time estimate:** 1.5 hours

**Completed:** Added vault path to ConfigService with nested schema (trello/obsidian sections). Created notes subcommand group with daily, append, create-note, search-note commands. Learned: nested spread pattern for updating nested config, Commander subcommand groups, optional chaining for safe nested access.

---

### ✅ Task 2.4: Search implementation

- Use `grep` or `ripgrep` for fast search
- Return file path + matching line + context

**Done when:** `ctx notes search "nancy"` finds all mentions quickly

**Time estimate:** 1 hour

**Completed:** Implemented searchNotes() using grep via child_process. Handles no-matches (exit code 1) gracefully. Wired to CLI as `notes search-note`.

---

# ~~Phase 3: Google Calendar Foundation~~ (DESCOPED)

**Moved to parking lot.** OCR input unreliable, can't import behind firewall. Revisit if a better input method appears.

---

# Phase 4: The Bot (This Is The Product)

**Goal:** Text anything, get it routed correctly.

### ✅ Task 4.1: Telegram bot setup

- Message @BotFather on Telegram
- Create new bot, get token
- Store token in `~/.ctx/config.json`
- Test: send message, see it in bot API

**Done when:** You can send a message to your bot and retrieve it via API

**Time estimate:** 30 minutes

**Completed:** Created @CtxCapture_bot via BotFather. Token stored in `.env` (revoked and replaced after accidental exposure). Added `telegram test` (getMe) and `telegram update-test` (getUpdates) CLI commands. Verified token works, sent "Hello world!" and retrieved it via API. Learned: Telegram API URL pattern (token in path), update types (my_chat_member vs message), getUpdates returns array.

---

### Task 4.2: Gateway scaffold

**Create `src/gateway/server.ts`:**
```typescript
// Express server that:
// - Receives Telegram webhook POST
// - Extracts message text
// - Returns 200 OK immediately (Telegram requires fast response)
// - Processes message async
```

**Done when:**
- Server runs locally
- Telegram webhook hits it (use ngrok for testing)
- Messages logged to console

**Time estimate:** 2 hours

---

### Task 4.3: Claude integration for parsing

**Create `src/gateway/parser.ts`:**
```typescript
interface ParsedMessage {
  type: 'task' | 'note' | 'event' | 'unknown';
  content: string;
  dueDate?: string;  // extracted if present
  project?: string;  // extracted if present
  eventTime?: string; // for calendar events
  eventDuration?: number; // minutes
}

async function parseMessage(text: string): Promise<ParsedMessage>
```

**The prompt:**
```
You are a message parser. Given informal input, determine:
1. Is this a task (actionable), note (informational), or event (calendar)?
2. Extract the core content
3. Extract any due date or event time mentioned
4. Extract any project/context mentioned

Input: "nancy thursday uat"
Output: { "type": "task", "content": "follow up with Nancy about UAT", "dueDate": "thursday" }

Input: "routing broken again"
Output: { "type": "note", "content": "routing issue resurfaced" }

Input: "team sync tuesday 2pm 30min"
Output: { "type": "event", "content": "team sync", "eventTime": "tuesday 2pm", "eventDuration": 30 }

Be concise. When ambiguous, default to note.
```

**Done when:**
- Informal inputs get parsed correctly
- Token usage logged

**Time estimate:** 2 hours

---

### Task 4.4: Wire it together

```
Telegram message 
  → Gateway receives
  → Claude parses
  → Router decides: task, note, or event?
  → TrelloService.createCard() or ObsidianService.appendToDaily()
  → Reply to Telegram with confirmation
```

**Done when:**
- Text "nancy thursday uat" to your bot
- Trello card appears
- Bot replies "✓ task: follow up with Nancy about UAT — due Thursday"

**Time estimate:** 2 hours

---

### Task 4.5: Error handling

- If Claude parsing fails → default to note, log error
- If Trello fails → reply with error, log details
- If Obsidian fails → reply with error, log details
- If Calendar fails → reply with error, log details
- Never lose the original message

**Done when:** Failures are graceful and logged, original input preserved

**Time estimate:** 1 hour

---

# Phase 5: Deploy

**Goal:** Runs 24/7 so you can use it from work.

### Task 5.1: Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
CMD ["node", "dist/gateway/server.js"]
```

**Done when:** `docker build` and `docker run` work locally

**Time estimate:** 1 hour

---

### Task 5.2: Fly.io setup

- Install flyctl
- `fly auth login`
- `fly launch` — configure app

**Done when:** `fly auth whoami` shows your account

**Time estimate:** 30 minutes

---

### Task 5.3: Secrets configuration

```bash
fly secrets set TELEGRAM_BOT_TOKEN=xxx
fly secrets set TRELLO_API_KEY=xxx
fly secrets set TRELLO_TOKEN=xxx
fly secrets set ANTHROPIC_API_KEY=xxx
fly secrets set GOOGLE_CREDENTIALS=xxx
fly secrets set OBSIDIAN_VAULT_PATH=/data/vault
```

**Done when:** All secrets configured in Fly.io

**Time estimate:** 15 minutes

---

### Task 5.4: Persistent storage for Obsidian

- Create Fly.io volume for vault data
- Mount at `/data/vault`
- Decide sync strategy (git-based recommended)

**Done when:** Notes persist across deployments

**Time estimate:** 1 hour

---

### Task 5.5: Deploy

```bash
fly deploy
```

**Done when:**
- App is live
- Telegram webhook points to Fly.io URL
- Send message from iPad, card appears in Trello

**Time estimate:** 1 hour (plus debugging)

---

### Task 5.6: Health check + monitoring

- `GET /health` returns status
- Fly.io dashboard shows logs
- Set up alert if app crashes

**Done when:** You can see what's happening in production

**Time estimate:** 30 minutes

---

# Phase 6: Polish + Reliability

### Task 6.1: Vault sync (git-based)

- Vault is a git repo
- Gateway pulls before read, commits+pushes after write
- Can edit notes in Obsidian at home, gateway sees changes

**Done when:** Two-way sync works between local Obsidian and deployed gateway

**Time estimate:** 2 hours

---

### Task 6.2: Better Telegram UX

- `/status` — show today's captured items
- `/tasks` — show recent tasks created
- `/undo` — archive the last created task

**Done when:** Basic commands work

**Time estimate:** 2 hours

---

### Task 6.3: Daily digest

- Cron job at 6pm
- Sends summary: "Today you captured 12 items: 8 tasks, 4 notes"
- Lists any items that might need review

**Done when:** Daily summary arrives automatically

**Time estimate:** 1.5 hours

---

### Task 6.4: Batch processing

For when you dump multiple thoughts at once:

```
"nancy thursday uat
routing broken check with dev  
mom birthday gift
remind me to call doctor"
```

Should create 4 separate items.

**Done when:** Multi-line input creates multiple items

**Time estimate:** 1 hour

---

### Task 6.5: Calendar photo parsing

**The killer feature for your weekly calendar sync.**

- Telegram bot accepts image messages
- Claude Vision extracts calendar events from photo
- GoogleCalendarService creates events in bulk
- Reply with summary: "✓ Created 14 events for Feb 3-7"

**The prompt:**
```
Extract calendar events from this image of a work calendar.

Return as JSON array:
[
  { "title": "UAT Sync", "date": "2025-02-03", "start": "14:00", "end": "14:30" },
  { "title": "1:1 with Nancy", "date": "2025-02-04", "start": "10:00", "end": "10:30" }
]

Rules:
- Use 24-hour time format
- If end time unclear, assume 30 minutes
- If you can't read something clearly, mark it: { "title": "UNCLEAR - something sync?", ... }
- Include all visible events for the week
```

**Workflow:**
```
Sunday evening:
1. Take photo of work calendar on iPad
2. Send to Telegram bot
3. Bot replies: "Found 14 events. Creating..."
4. Bot replies: "✓ Created 14 events for Feb 3-7"
5. Events sync to Apple Calendar automatically
```

**Done when:**
- Photo of calendar → events in Google Calendar
- Unclear items flagged for manual review
- Apple Calendar shows synced events

**Time estimate:** 3-4 hours

---

### Task 6.6: Calendar conflict detection

When parsing calendar photo:
- Check for existing events at same time
- Warn: "⚠️ Conflict: 'UAT Sync' overlaps with existing 'Team Standup'"
- Ask for confirmation or skip

**Done when:** Duplicates don't pile up week over week

**Time estimate:** 1 hour

---

# Timeline (Realistic)

| Phase | Weeks | Outcome |
|-------|-------|---------|
| 1: Trello Foundation | 1 | TrelloService extracted, config working |
| 2: Obsidian Foundation | 1-2 | Can write to vault from code |
| 3: Google Calendar | 1-2 | Can create events, syncs to Apple Calendar |
| 4: The Bot | 2 | Working locally, Claude parsing |
| 5: Deploy | 1 | Live on Fly.io |
| 6: Polish | 2-3 | Calendar photo parsing, daily digest, reliable |

**Total to usable system: 8-12 weeks**

With your schedule (2hrs weekday, 4hrs weekend), call it **10-14 weeks** to something you're using daily from your iPad at work.

---

# The Definition of Done

**Scenario 1: Quick capture**

You're in a 30-minute call. A thought hits. You grab your iPad:

```
"ask nancy about deadline change"
```

Send. Back in the meeting before anyone noticed.

That night, the task is already in Trello. The raw capture is in your daily note.

**Scenario 2: Weekly calendar sync**

Sunday evening. You snap a photo of next week's calendar on your work machine.

Send to Telegram.

```
Bot: Found 18 events for Feb 3-7. Creating...
Bot: ✓ Created 18 events
Bot: ⚠️ 2 unclear items saved to daily note for review
```

Monday morning, your Apple Calendar already has the week loaded.

**That's the product.**

---

# Appendix A: Future Enhancements

These were in the original task plan but cut to focus on the core problem. They're not abandoned — just deferred until the basics work. Reference material for when you're ready.

---

## SQLite Local Cache

**What:** Local database storing boards, lists, cards. Faster queries, offline capability, local search.

**Original tasks:**
- Set up better-sqlite3
- Create tables: boards, lists, cards
- Sync from Trello API to local DB
- `ctx trello search "keyword"` queries locally

**Why deferred:** Not on critical path. API latency is fine for your volume.

**When to add:** If you want instant search across all cards, or offline access to your task data.

**Effort:** ~4-6 hours

---

## REST API Layer

**What:** Your own HTTP API exposing all services. Any client can call it.

**Original tasks:**
- Express server with `/boards`, `/cards`, `/notes` endpoints
- Input validation, consistent error responses
- API key authentication
- OpenAPI documentation

**Why deferred:** Telegram webhook *is* your API. No other clients need HTTP access.

**When to add:** If you build a web dashboard, want Shortcuts/Automator integration, or other tools to trigger actions.

**Effort:** ~6-8 hours

---

## Gmail Integration

**What:** Search and read emails programmatically. Surface information without opening Gmail.

**Original tasks:**
- Gmail API OAuth (read-only scope)
- `ctx gmail search "from:boss subject:urgent"`
- `ctx gmail read <message-id>`
- Parse MIME/attachments

**Why deferred:** Read-only email is lower value than capture. Your core pain is getting thoughts *out*, not searching emails.

**When to add:** If you want the agent to surface email content, or trigger actions based on incoming mail.

**Effort:** ~8-10 hours

---

## Playwright Browser Automation

**What:** Headless browser control. Navigate, click, type, screenshot, scrape.

**Original tasks:**
- Browser instance management
- Navigation primitives (go, back, refresh)
- Interaction primitives (click, type, submit)
- Data extraction (tables, links, structured data)
- Session/cookie management
- Safety guardrails (URL allowlist)

**Why deferred:** High complexity, no immediate use case. Maintenance burden.

**When to add:** If you have repetitive web tasks with no API — filling timesheets, scraping internal dashboards, etc.

**Effort:** ~15-20 hours

---

## MCP Compliance

**What:** Model Context Protocol — Anthropic's standard for tool integration. Makes your services discoverable by any MCP-compliant client.

**Original tasks:**
- Study MCP spec, pin stable SDK version
- MCP server scaffold with discovery
- Tool schemas for all services
- Context injection (defaults, timezone)

**Why deferred:** Spec still stabilizing. Your Telegram bot doesn't need it. Adds abstraction without immediate benefit.

**When to add:** When MCP matures and you want Claude Desktop or other agents to call your services directly.

**Effort:** ~10-12 hours

---

## Webhook Triggers

**What:** Inbound webhooks from external services trigger agent actions.

**Examples:**
- GitHub push → create task to review PR
- Calendar event starting → send reminder
- Email from specific sender → surface in Telegram

**Why deferred:** Reactive automation before proactive capture is working. Adds attack surface.

**When to add:** When core system is stable and you want event-driven workflows.

**Effort:** ~4-6 hours per integration

---

## Advanced Scheduling

**What:** Complex cron jobs beyond the daily digest.

**Examples:**
- "Every Monday 8am, summarize last week's completed tasks"
- "If nothing captured by 2pm, send a nudge"
- "Every Friday, generate weekly review template"

**Why deferred:** Daily digest (Task 6.3) covers the basics. Complex scheduling adds edge cases.

**When to add:** When you want proactive agent behavior, reminders, or automated reviews.

**Effort:** ~3-4 hours per scheduled task

---

## Vector Search for Notes

**What:** Semantic search using embeddings. Find notes by meaning, not just keywords.

**Original approach:**
- Local embeddings (sqlite-vss or similar)
- `ctx notes semantic "that conversation about deadlines"`
- No external API calls

**Why deferred:** Your vault is small. Grep/ripgrep handles keyword search fine.

**When to add:** If your vault grows large and you're missing relevant notes with keyword search.

**Effort:** ~6-8 hours

---

## Multi-User Support

**What:** Multiple people using the system with isolated data.

**Would require:**
- User authentication
- Per-user config and tokens
- Access control
- Isolated Trello boards / vaults per user

**Why deferred:** You're the only user. Telegram bot token *is* your auth.

**When to add:** Probably never. If family wants this, they get their own instance.

**Effort:** ~15-20 hours (significant refactor)

---

## Alternative Input Channels

**What:** Beyond Telegram — SMS, email-to-task, Slack, etc.

**Options:**
- Twilio SMS (costs money per message)
- Email parsing (send to tasks@yourdomain.com)
- Slack bot (if you used Slack personally)

**Why deferred:** Telegram works. It's free. It's on all your devices.

**When to add:** If Telegram becomes unavailable or you want redundancy.

**Effort:** ~4-8 hours per channel

---

# Appendix B: Extended Learning Path (Original Phases)

The original task plan was designed as a comprehensive software engineering curriculum. If you want the full educational experience later, here are the phases that were condensed or removed. They teach valuable skills even if they're not on the critical path to your product.

---

## Original Phase 2: Data Persistence (SQLite Focus)

**Skills learned:** Database design, SQL, caching strategies, cache invalidation

### Tasks:
- 2.1: Store config in ~/.trello-cli/config.json
- 2.2: Cache boards/lists to JSON with timestamps
- 2.3: Cache invalidation (--refresh flag, 5-minute expiry)
- 2.4: Use default board (fewer arguments for common ops)
- 2.5: Set up SQLite with better-sqlite3
- 2.6: Migrate caching to SQLite
- 2.7: Add local search across cards

**Why valuable:** Understanding persistence, caching, and databases is fundamental. JSON files work for config; SQLite is the right tool when you need queries.

---

## Original Phase 3: Build Your Own API

**Skills learned:** HTTP servers, routing, REST design, input validation, auth

### Tasks:
- 3.1: Hello World Express server
- 3.2: GET /boards endpoint
- 3.3: GET /boards/:boardId/lists with 404 handling
- 3.4: Cards endpoints (GET and POST)
- 3.5: PUT /cards/:cardId/move, DELETE /cards/:cardId
- 3.6: Input validation with helpful 400 errors
- 3.7: Consistent error response format
- 3.8: Bearer token authentication
- 3.9: API documentation (API.md)
- 3.10: Basic tests with vitest/jest

**Why valuable:** Every backend developer needs to build APIs. Understanding REST, validation, and auth from the inside makes you better at consuming them too.

---

## Original Phase 4: Deployment

**Skills learned:** Docker, environment config, production concerns, monitoring

### Tasks:
- 4.1: Environment variables for all secrets
- 4.2: Health check endpoint
- 4.3: Request logging (method, path, status, duration)
- 4.4: Dockerfile creation
- 4.5: Fly.io setup
- 4.6: First deploy with secrets
- 4.7: Production verification
- 4.8: Basic monitoring setup

**Why valuable:** Getting code running on your machine to running in production is a critical skill gap for many developers.

---

## Original Phase 5: LLM Integration

**Skills learned:** Tool schemas, function calling, debugging distributed systems

### Tasks:
- 5.1: Define JSON schema for your API
- 5.2: Test with Claude using your API as a tool
- 5.3: Debug a real production issue (something *will* break)

**Why valuable:** LLM tool use is the future. Understanding how to make your APIs LLM-friendly is increasingly important.

---

## Original Phase 6: Google Calendar (Full Version)

**Skills learned:** OAuth2 deeply, Google APIs, timezone handling, recurring events

### Additional tasks beyond current plan:
- 6.7: Search events by text
- 6.9: Update events without clobbering fields
- 6.12: Recurring events (RRULE parsing and creation)
- 6.13: Calendar REST API endpoints

**Why valuable:** The full OAuth2 flow and Google API patterns transfer to any Google service.

---

## Original Phase 7: Gmail Integration

**Skills learned:** MIME parsing, RFC 2822, email threading, Gmail search operators

### Tasks:
- 7.1: Enable Gmail API, incremental scopes
- 7.2: List messages with filters and pagination
- 7.3: Read message with MIME parsing
- 7.4: Gmail search operators
- 7.5: Send email (RFC 2822 raw format)
- 7.6: Reply with correct threading (In-Reply-To, References headers)
- 7.7: Draft management
- 7.8: Labels
- 7.9: Attachments
- 7.10: Gmail REST endpoints

**Why valuable:** Email is deeply weird. Understanding MIME and threading makes you appreciate how much complexity email clients hide.

---

## Original Phase 8: Notes Gateway (Full Version)

**Skills learned:** File I/O, sync strategies, conflict resolution, append-only safety

### Additional tasks beyond current plan:
- 8.2: REST auth with API key
- 8.3: Audit logging
- 8.5: Safety guardrails (path traversal prevention, denylist)
- 8.6: Git-based conflict strategy
- 8.7: Agent-friendly templates with standard sections
- 8.8: Optional embeddings/vector search

**Why valuable:** Building a safe file-based system that agents can write to teaches you about trust boundaries.

---

## Original Phase 9: Playwright Browser Automation

**Skills learned:** Browser automation, selectors, waiting strategies, error recovery

### Tasks:
- 9.1: Browser instance management
- 9.2: Navigation primitives
- 9.3: Page reading (text, title, screenshot)
- 9.4: Click and type with auto-wait
- 9.5: Form handling
- 9.6: Waiting strategies (element, navigation, text, network idle)
- 9.7: Data extraction (tables, links, structured)
- 9.8: Error handling with auto-screenshot on failure
- 9.9: Session/cookie management
- 9.10: CLI commands for browser
- 9.11: REST endpoints for browser
- 9.12: Safety guardrails

**Why valuable:** Browser automation is powerful but fragile. Learning to build robust automation teaches patience and defensive coding.

---

## Original Phase 10: MCP Compliance

**Skills learned:** Protocol implementation, tool schema design, context management

### Tasks:
- 10.1: Study MCP spec thoroughly
- 10.2: MCP server scaffold with discovery
- 10.3: Tool schemas for all domains
- 10.4-10.8: Wrap all services as MCP tools
- 10.9: Context injection (defaults, timezone)
- 10.10: Error standardization
- 10.11: Logging and observability
- 10.12: End-to-end workflow testing

**Why valuable:** Understanding protocols and making your tools interoperable is senior-level thinking.

---

## Original Timeline

| Phases | Weeks |
|--------|-------|
| 1-5 (Trello CLI + API + Deploy) | ~15 |
| 6-10 (Calendar, Gmail, Notes, Playwright, MCP) | ~17 |
| **Total** | **~32 weeks** |

With life friction: **40-45 weeks** — under a year to comprehensive full-stack + AI tooling skills.

---

## The Trade-off

**Focused plan (current):** 10-14 weeks to a usable product. Learn by building what you need.

**Extended plan (appendix):** 40-45 weeks to comprehensive education. Learn by building everything.

Both are valid. The focused plan gets you capturing thoughts from your iPad faster. The extended plan makes you a more complete engineer. You can always come back to these phases later.
