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
- Local dev: secrets in `.env` (gitignored)
- Deploy: secrets in `~/.ctx/` or platform secrets manager (e.g., `fly secrets set`)
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
- Store token in `.env`
- Test: send message, see it in bot API

**Done when:** You can send a message to your bot and retrieve it via API

**Time estimate:** 30 minutes

**Completed:** Created @CtxCapture_bot via BotFather. Token stored in `.env` (revoked and replaced after accidental exposure). Added `telegram test` (getMe) and `telegram update-test` (getUpdates) CLI commands. Verified token works, sent "Hello world!" and retrieved it via API. Learned: Telegram API URL pattern (token in path), update types (my_chat_member vs message), getUpdates returns array.

---

### ✅ Task 4.2: Gateway scaffold

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

**Completed:** Created Express server in `src/gateway/server.ts`. POST `/webhook` route receives Telegram updates, extracts `message.text`, logs with timestamp, returns 200 OK. Tested locally with curl, then connected via ngrok + Telegram `setWebhook`. Sent messages from Telegram app, verified they appear in server console. Installed express + @types/express.

---

### ✅ Task 4.3: Claude integration for parsing

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

**Completed:** Created `src/gateway/parser.ts` with `parseMessage()` function. Uses Anthropic SDK with Claude 3.5 Haiku for intent classification. Zod schema validates Claude's JSON response into `ParsedMessage` type (task/note/event/unknown). System prompt with few-shot examples handles informal input. Token usage logged per call. Tested via CLI `telegram parse` command with various inputs.

---

### ✅ Task 4.4: Wire it together

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

**Completed:** Wired full end-to-end flow in `server.ts`. Added `handleMessage()` with Result-based routing: parse → switch on type → call TrelloService or ObsidianService → reply via Telegram. Fixed import order bug (dotenv must load before parser to populate `ANTHROPIC_API_KEY`). Fixed TypeScript narrowing issues: `trellodefaultlist!` (module-level guard doesn't carry into functions) and `safeData.dueDate ?? undefined` (nullish coalescing to bridge `null | undefined` → `undefined`). Live test confirmed: Telegram → Claude parse → Trello card created → bot reply. Known issue: due date format ("thursday") not accepted by Trello API — tracked in Task 4.4a-7.

---

### Task 4.4a: Hardening pass

Address security, correctness, and robustness findings before wiring error handling.

#### Subtasks

- [x] **4.4a-1: Webhook authentication** — verify Telegram secret token header on `/webhook`; reject unauthenticated requests
- [x] **4.4a-2: Obsidian path traversal guard** — restrict read/write paths to vault-relative only; reject absolute paths and `..` traversal
- [x] **4.4a-3: Timezone fix** — daily note date uses local time, not UTC `toISOString()`; entries and filename use same timezone
- [x] **4.4a-4: Startup config validation** — fail fast with clear messages for missing `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BASE_URL`, `ANTHROPIC_API_KEY`
- [x] **4.4a-5: `request()` non-JSON handling** — wrap `response.json()` in try/catch to maintain `Result<T>` contract on HTML/error responses
- [x] **4.4a-6: Config read error handling** — catch `readFileSync` failures within `Result` flow
- [x] **4.4a-7: Due-date contract consistency** — align parser output format with what TrelloService actually accepts (parseable date strings, not "thursday")
- [x] **4.4a-8: Zod schema fixes** — `LabelSchema.color` should be `.nullable()` (Trello returns `null` for colorless labels); audit other schemas for similar gaps

**Done when:**
- Unauthenticated webhook requests are rejected
- Obsidian paths can't escape the vault
- Daily notes use correct local date near midnight
- Missing env vars fail at startup with actionable error messages
- Non-JSON API responses don't throw unhandled exceptions
- Parser due-date output matches Trello's expected input format
- All Zod schemas handle nullable fields Trello actually returns

**Time estimate:** 3-4 hours

---

---
# Phase 4A: The Agent Loop

**Goal:** Replace the classifier→switch dispatch with a tool-calling loop. The LLM decides which services to call, executes them, sees results, and decides what to do next.

**Skills:** Anthropic tool use API, agent loop pattern, message accumulation, multi-step reasoning, human-in-the-loop confirmation

**Why now:** You have working services (Trello, Obsidian), a working gateway (Express + Telegram webhook), and a working LLM integration (Anthropic SDK + Haiku). The only thing your current architecture can't do is multi-step tasks. This phase fixes that by giving Haiku direct access to your services as tools and letting it loop until the task is done.

**What changes:** `parser.ts` becomes `agent.ts`. The `switch(parsed.type)` routing in `server.ts` becomes a `while` loop. Your services don't change at all.

**Prerequisites:** Phase 4 complete (including 4.4a hardening and 4.5 error handling).

---

## ✅ Task 4A.1: Define tool schemas

Convert your existing service methods into Anthropic tool definitions.

**Create `src/agent/tools.ts`:**

You already have Zod schemas on your services. Now you need to express them in the shape the Anthropic SDK expects for tool use. Each tool gets a `name`, `description`, and `input_schema` (JSON Schema, which Zod can generate via `zod-to-json-schema` — or you write by hand, your call).

**Tools to define (map directly from your existing services):**

| Tool Name | Source | What It Does |
|-----------|--------|-------------|
| `create_task` | `TrelloService.createCard()` | Creates a Trello card with name, optional description, optional due date |
| `get_cards` | `TrelloService.getCards()` | Lists cards on a given list |
| `move_card` | `TrelloService.moveCard()` | Moves a card to a different list |
| `archive_card` | `TrelloService.archiveCard()` | Archives a card |
| `set_due_date` | `TrelloService.setDue()` | Sets or updates due date on a card |
| `append_note` | `ObsidianService.appendToDaily()` | Appends timestamped entry to today's daily note |
| `search_notes` | `ObsidianService.searchNotes()` | Searches Obsidian vault for a query |
| `read_daily` | `ObsidianService.getDailyNotePath() + readNote()` | Reads today's daily note |

**Example (one tool — you write the rest):**

```typescript
const tools = [
  {
    name: 'create_task',
    description: 'Create a new task as a Trello card. Use when the user mentions something actionable that needs to be tracked.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'The task title — clean it up from informal input' },
        description: { type: 'string', description: 'Optional details or context for the task' },
        due_date: { type: 'string', description: 'ISO 8601 date string if a deadline is mentioned. Resolve relative dates like "thursday" to actual dates.' },
      },
      required: ['name'],
    },
  },
  // ... rest of tools
];
```

**Decisions you need to make:**

- Do you convert Zod schemas to JSON Schema with a library, or hand-write them? Hand-writing is simpler for 8 tools. Library is cleaner if you plan to add many more. Pick one.
- Tool descriptions matter a lot. They're how Haiku decides which tool to use. Write them like you're explaining to a new team member what each one does and when to use it.

**Done when:**
- All 8 tools defined with name, description, and input_schema
- Each schema matches what the corresponding service method actually accepts
- Exported as an array from `src/agent/tools.ts`

**Time estimate:** 1-1.5 hours

---

## ✅ Task 4A.2: Build the agent loop

Replace `parser.ts` with `agent.ts`. This is the core change.

**Create `src/agent/agent.ts`:**

The structure:

```
1. Receive user message (from Telegram)
2. Build messages array: system prompt + user message
3. Call Haiku with messages + tools
4. Check response:
   a. If stop_reason is 'end_turn' → extract text, return to user
   b. If stop_reason is 'tool_use' → execute each tool call, 
      append tool results to messages, go to step 3
5. Safety: if iterations > MAX_ITERATIONS, break and tell user
```

**The system prompt (replaces your classifier prompt):**

```
You are a personal assistant that helps capture and organize tasks, notes, and information.
You have access to tools for managing Trello cards and Obsidian notes.

When the user sends informal input:
- If it's actionable → use create_task
- If it's informational → use append_note
- If it requires multiple steps → call tools in sequence
- If ambiguous → default to append_note

The user is texting quickly from their phone during meetings. Input will be informal.
Clean up the content before creating tasks or notes.

Resolve relative dates: "thursday" means the next upcoming Thursday.
Today is ${new Date().toLocaleDateString()}.

Always confirm what you did in a brief, friendly reply.
```

**What the loop looks like (pseudocode — you write the real version):**

```typescript
async function runAgent(userMessage: string): Promise<string> {
  const messages = [{ role: 'user', content: userMessage }];
  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: tools,
      messages: messages,
    });

    // Accumulate assistant response into messages
    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      // Extract text blocks from response.content
      // Return the text to the user
    }

    if (response.stop_reason === 'tool_use') {
      // Find all tool_use blocks in response.content
      // Execute each one against your services
      // Build tool_result messages
      // Push tool results into messages
      // Loop continues
    }
  }

  return 'I hit my iteration limit. Something might be stuck.';
}
```

**Key concept — message accumulation:**

Every Anthropic API call sees the full conversation so far. You push the assistant's response (including tool_use blocks) into messages, then push the tool results, then call the API again. Haiku sees what it asked for and what it got back, and decides what to do next.

This is the exact same pattern as Scott's `run.ts` — the `while(true)` with `messages.push(...)`.

**Done when:**
- `runAgent(message)` takes a string, returns a string
- Single-step tasks work: "nancy thursday uat" → creates card → returns confirmation
- Multi-step tasks work: "what tasks do I have on my inbox list" → calls get_cards → returns formatted list
- MAX_ITERATIONS prevents infinite loops
- Replaces `parseMessage()` in your gateway's `handleMessage()`

**Time estimate:** 3-4 hours (this is the hardest task in the phase)

---

## ✅ Task 4A.3: Wire the executor

Create the function that takes a tool name + arguments and calls the right service.

**Create `src/agent/executor.ts`:**

```typescript
async function executeTool(
  name: string, 
  input: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case 'create_task':
      // call trelloService.createCard(...)
      // return Result-friendly string
    case 'append_note':
      // call obsidianService.appendToDaily(...)
    // ... etc
    default:
      return `Unknown tool: ${name}`;
  }
}
```

**Important:** Your services return `Result<T>`. The executor needs to unwrap those results into strings that Haiku can understand. If the result is success, format the data clearly. If it's failure, return the error message so Haiku can tell the user what went wrong (or try something else).

**Done when:**
- Every tool defined in 4A.1 has a corresponding case in the executor
- Success results return useful data (card ID, card name, note path, etc.)
- Failure results return clear error messages
- The executor is called from the agent loop in 4A.2

**Time estimate:** 1-1.5 hours

**Completed:** Created `src/agent/executor.ts` with factory pattern `createExecutor(deps)` returning `executeTool` function. 10 cases matching all tools in tools.ts. Each case: safeParse input with Zod schema → call service → unwrap Result into string. Updated `runAgent()` signature to accept `executeTool` as parameter (dependency injection via function arg). Removed stub from agent.ts.

---

## ✅ Task 4A.4: Update the gateway

Replace the classifier dispatch in `server.ts` with the agent.

**What changes in `handleMessage()`:**

Before (your current code):
```
const parsed = await parseMessage(text);
switch (parsed.type) {
  case 'task': trelloService.createCard(...)
  case 'note': obsidianService.appendToDaily(...)
  ...
}
```

After:
```
const reply = await runAgent(text);
// Send reply to Telegram
```

That's it. The entire routing logic collapses into one function call.

**Keep the existing error handling pattern:** If `runAgent` throws, catch it, log it, reply with a generic error to Telegram. Same structure you already have.

**Done when:**
- `handleMessage()` calls `runAgent()` instead of `parseMessage()` + switch
- End-to-end works: Telegram message → agent loop → tool execution → Telegram reply
- Old `parser.ts` is either deleted or kept for reference (your call)

**Time estimate:** 30 minutes

**Completed:** Replaced `handleMessage()` in `server.ts`. Removed `parseMessage()` + switch dispatch entirely. Now calls `runAgent(text, executeTool)` → `sendReply()`. Executor created at module level (deps don't change between messages). Removed `ParsedMessage` and `Result` imports. Live tested via Telegram: task creation with resolved due date, note append, and multi-tool call (task + note in single turn) all working. Return type simplified to `Promise<void>` — `handleMessage` sends the reply itself instead of returning a Result.

---

## ✅ Task 4A.5: Human-in-the-loop for destructive operations

Some tools shouldn't execute without confirmation. Archive is destructive (move_card descoped — not destructive).

**The pattern (adapted for Telegram):**

When the agent wants to call `archive_card` or `move_card`:
1. Instead of executing immediately, send a confirmation message to Telegram: "Archive card 'Follow up with Nancy' — confirm? (yes/no)"
2. Wait for the user's next message
3. If "yes" → execute the tool, continue the loop
4. If "no" → return a tool_result that says "User declined" so Haiku can respond accordingly

**Implementation options (pick one):**

- **Simple:** Tag certain tools as `requiresApproval` in your tool definitions. In the executor, check the tag before executing. If approval needed, reply to Telegram and wait for confirmation. This blocks the loop but is easy to build.
- **State-based:** Store pending approvals in memory (a Map keyed by chat ID). When a confirmation comes in via webhook, resolve the pending operation. This is more robust but more complex.

Start with simple. You can upgrade later.

**Done when:**
- `archive_card` prompts for confirmation before executing
- User can approve or reject
- Rejected tool calls feed back into the agent loop so Haiku can respond naturally
- Non-destructive tools (create_task, append_note, search, read) execute immediately

**Time estimate:** 2-3 hours

**Completed:** Scoped to `archive_card` only (`move_card` descoped — not destructive). Added `ExecutorResult` discriminated union (`success` | `confirmation_required`) replacing plain string returns. `PendingApproval` stored in per-chat `Map<number, PendingApproval>` in server.ts. Executor stores pending via `setPendingApproval` callback on `ExecutorDeps`. Agent loop checks `result.status`, exits early on `confirmation_required`. `handleMessage` checks Map before routing to agent — yes executes archive, no cancels, anything else falls through to normal agent. Added `name` field to `ArchiveCardInput` for human-readable confirmation messages. Live tested via Telegram.

---

## Task 4A.6: Agent error handling

Wrap the agent loop in robust error handling. This replaces/extends your existing Task 4.5 from the original plan.

**Scenarios to handle:**

| Scenario | Behavior |
|----------|----------|
| Anthropic API call fails (network, rate limit) | Retry once with backoff. If still fails, reply with friendly error. Never lose the original message. |
| Haiku requests a tool that doesn't exist | Return tool_result with error message. Haiku will self-correct or explain. |
| Tool execution fails (Trello API down, bad input) | Return the error as tool_result. Let Haiku decide how to respond. |
| Haiku loops without progress | MAX_ITERATIONS catches this. Reply explaining the limit. |
| Haiku returns empty response | Fallback: "I couldn't process that. Try rephrasing?" |

**The key insight from Scott's repo:** Don't try to handle every error in your code. Return errors as tool results and let the LLM figure out how to communicate the failure. The LLM is better at writing error messages than your switch statement.

**Done when:**
- API failures don't crash the server
- Tool failures get reported back to Haiku, which explains them to the user
- No message is ever silently lost
- Structured logging captures: user input, tools called, results, final response, token usage

**Time estimate:** 1.5-2 hours

---

## Task 4A.7: Context window awareness

Add basic token tracking. You don't need compaction yet (Telegram conversations are short), but you need to know when you're approaching limits.

**Simple version:**

- Track messages array length per conversation
- Estimate tokens using character count ÷ 4 (same approach as Scott's repo)
- Log a warning if a single agent run exceeds 50% of Haiku's context window
- For now, each Telegram message starts a fresh conversation (no persistence between messages)

**Future consideration (not this task):** If you add conversation persistence (multi-message sessions), you'll need compaction like Scott built. For now, fresh context per message is fine because your use case is quick captures, not extended conversations.

**Done when:**
- Token usage logged per agent run
- Warning emitted if usage is high
- You can see in logs how much each interaction costs

**Time estimate:** 30-45 minutes

---

## Phase 4A Checkpoint

**Done when all of this works end-to-end:**

```
You (2:47pm): "nancy thursday uat"
Bot: ✓ Created task: "Follow up with Nancy about UAT" — due Thursday

You (3:12pm): "routing broken again check with dev"
Bot: ✓ Added to daily note: "routing issue resurfaced — check with dev team"

You (3:30pm): "what tasks did I create today"
Bot: Here's what's on your inbox list:
     • Follow up with Nancy about UAT — due Thu Feb 20
     • Review deployment checklist — no due date

You (4:00pm): "archive the nancy card"
Bot: Archive "Follow up with Nancy about UAT"? (yes/no)
You: yes
Bot: ✓ Archived.

You (4:15pm): "search my notes for routing issues"
Bot: Found 3 matches:
     • Daily/2026-02-14.md: "routing issue resurfaced — check with dev team"
     • Daily/2026-02-10.md: "routing broken in staging env"
     • Notes/fco-issues.md: "routing logic needs refactor per Nancy"
```

**None of these interactions are hard-coded.** The agent loop handles all of them through tool selection. Adding a new capability (like a future Calendar service) means defining a new tool and adding a case to the executor. The agent figures out when to use it.

**Total estimated time:** 10-13 hours (2-3 weekends at your pace)

---

## What This Replaces in the Original Plan

| Original Task | Status |
|---------------|--------|
| Phase 6 Task 6.2 (`/status`, `/tasks`, `/undo` commands) | **Replaced by** natural language through the agent loop |
| Phase 6 Task 6.4 (Batch processing) | **Replaced by** agent making multiple tool calls per message |

**What stays unchanged:**
- Phase 5 (Deploy) — Docker, Fly.io, secrets, health check. Proceed as planned.
- Phase 6 Task 6.1 (Vault sync) — Still needed, agent doesn't change this.
- Phase 6 Task 6.3 (Daily digest cron) — Still needed, agent can't self-initiate.
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

### Task 5.7: Automated tests

Add test coverage for the core paths: API integrations, file I/O, and parser logic.

- Set up vitest (or jest) with a `test` script in `package.json`
- Unit tests for `parseMessage()` — task/note/unknown classification, due-date extraction
- Unit tests for `request()` — success, non-JSON, network failure
- Unit tests for `ObsidianService` — daily note creation, append, path traversal rejection
- Integration test for `TrelloService` — mock HTTP, verify Zod validation on real-shaped responses
- CI: add `npm test` to pre-commit or check script

**Done when:**
- `npm test` runs and passes
- Core parsing, request, and service logic has coverage
- Tests catch regressions in Zod schemas and Result handling

**Time estimate:** 3-4 hours

---

# Phase 6: Polish + Reliability

### Task 6.0: Code hardening

Defensive fixes identified during cross-AI audit (Claude + ChatGPT).

- [ ] **6.0-1: Guard empty `response.content` array** — check length before dereferencing `[0]` in parser.ts; empty array currently throws outside the Result pattern
- [ ] **6.0-2: Typed Anthropic errors** — differentiate auth, rate-limit, and network failures in parser.ts catch block instead of flattening all to `NETWORK_ERROR`
- [ ] **6.0-3: Zod-validate Telegram webhook payload** — replace `req.body as TelegramUpdate` type assertion with a Zod schema; this is external input from the internet
- [ ] **6.0-4: Constructor-inject Trello base URL** — move `process.env.TRELLO_BASE_URL` from implicit read inside `buildURL()` to constructor parameter for testability
- [ ] **6.0-5: Remove `!` assertion in parser** — `process.env.ANTHROPIC_API_KEY!` at module level (parser.ts:5) crashes before any validation can run; pass via function parameter or validate first

**Done when:**
- Parser handles empty API responses without throwing
- Anthropic error types surface in logs (auth vs rate-limit vs network)
- Webhook payload is validated, not trusted
- TrelloService has no hidden env dependencies
- No module-level non-null assertions on env vars

---

### Task 6.1: Vault sync (git-based)

- Vault is a git repo
- Gateway pulls before read, commits+pushes after write
- Can edit notes in Obsidian at home, gateway sees changes

**Done when:** Two-way sync works between local Obsidian and deployed gateway

**Time estimate:** 2 hours

---

### ~~Task 6.2: Better Telegram UX~~ (REPLACED)

**Replaced by** natural language through the agent loop.

---

### Task 6.3: Daily digest

- Cron job at 6pm
- Sends summary: "Today you captured 12 items: 8 tasks, 4 notes"
- Lists any items that might need review

**Done when:** Daily summary arrives automatically

**Time estimate:** 1.5 hours

---

### Task 6.7: Break up index.ts into service command modules

`index.ts` has grown to handle CLI commands for every service (Trello, Obsidian, Telegram, notes, config). Split into discrete command modules per service.

- [ ] **6.7-1:** Create `src/commands/trello.ts` — move all Trello CLI commands
- [ ] **6.7-2:** Create `src/commands/notes.ts` — move all Obsidian/notes CLI commands
- [ ] **6.7-3:** Create `src/commands/telegram.ts` — move all Telegram CLI commands
- [ ] **6.7-4:** Create `src/commands/config.ts` — move config subcommands
- [ ] **6.7-5:** Slim `index.ts` to just Commander setup + imports from command modules

**Done when:**
- Each service's commands live in their own file
- `index.ts` is a thin shell that registers command modules
- All existing CLI commands still work identically

**Time estimate:** 2-3 hours

---

### Task 6.8: Morning briefing — tasks due today and this week

Scheduled message (cron or Telegram command) that surfaces what's due.

- [ ] **6.8-1:** Add `getCards` filter for due dates (today + next 7 days) via Trello API `due` filter or client-side filtering
- [ ] **6.8-2:** Format briefing message — group by "Due Today" and "Coming Up This Week", sorted by date
- [ ] **6.8-3:** Wire to scheduled trigger (cron job or `/morning` Telegram command — pick one to start)
- [ ] **6.8-4:** Send briefing to Telegram chat

**Done when:**
- Morning message lists all cards due today and within the next 7 days
- Cards grouped and sorted by due date
- Delivered to Telegram automatically or on demand

**Time estimate:** 2-3 hours

---

### ~~Task 6.4: Batch processing~~ (REPLACED)

**Replaced by** agent making multiple tool calls per message.

---

### ~~Task 6.5: Calendar photo parsing~~ (DESCOPED)

**Moved to parking lot.** Google Calendar was descoped (Phase 3). Revisit if calendar integration is added later.

---

### ~~Task 6.6: Calendar conflict detection~~ (DESCOPED)

**Moved to parking lot.** Depends on calendar integration.

---

# Phase 7: Extract the Learning System

**Goal:** The learning system itself becomes a portable, enforceable product — not just markdown suggestions, but infrastructure that works on the next project.

### Task 7.1: Migrate to `.claude/rules/`

- Move `docs/learning_protocols.md` → `.claude/rules/learning.md`
- Move `docs/session_protocols.md` → `.claude/rules/session.md`
- Move `docs/phase_review.md` → `.claude/rules/phase-review.md`
- Add YAML frontmatter for path-specific activation where appropriate
- Update CLAUDE.md references from `@docs/` to `.claude/rules/`
- Prune CLAUDE.md — remove anything Claude already does correctly without being told

**Done when:**
- Rules load from `.claude/rules/` instead of `@docs/`
- CLAUDE.md is a tight reference card, not documentation
- All existing learning protocols still function

**Time estimate:** 1-2 hours

---

### Task 7.2: Create `.claude/settings.json`

- Add JSON schema header for VS Code autocomplete
- Configure basic settings (model preferences, permissions)
- Understand settings precedence (managed > CLI > local > project > user)

**Done when:**
- Settings file exists with schema validation
- VS Code provides autocomplete for settings

**Time estimate:** 30 minutes

---

### Task 7.3: Phase gate hook

- Write phase gate hook (bash or agent type) that checks HANDOFF.md for phase completion marker
- Hook blocks progression to next phase until review protocol is complete
- Add phase completion markers to HANDOFF.md format
- Update phase_review.md to include cross-AI audit step and marker insertion

**Done when:**
- Claude is blocked from starting next-phase work without the marker
- Phase review protocol includes: cross-AI audit → triage → Exam mode fixes → marker
- Hook fires and blocks correctly (tested)

**Time estimate:** 2-3 hours

---

### Task 7.4: Document the learning system

- Write up the system design: modes, contracts, gates, hooks
- Explain what it enforces and why
- Include evidence it works (commit history progression, session logs, mode transitions)
- This is the portfolio artifact — not the bot, not the code

**Done when:**
- A stranger can read the writeup and understand the system
- The writeup links to concrete evidence (commits, session notes, Exam mode artifacts)

**Time estimate:** 2-3 hours

---

### Task 7.5: Evaluate Project 2 — the learning bot

This system taught you TypeScript. The next project uses the same infrastructure to teach others.

- Review what the learning system actually needed: memory (HANDOFF.md), curriculum (task-plan.md), modes (adaptive difficulty), enforcement (hooks/gates), cross-AI audit
- Identify which pieces are reusable vs project-specific
- Sketch the learning bot concept: message-based tutoring with curriculum progression, session memory, mode transitions, and progression enforcement
- Decide: is this a new repo, or an extension of ctx?
- Output: a `PROJECT2.md` or equivalent scoping doc — not a full task plan, just enough to know if it's real

**Done when:**
- You've answered: what would this product do, who is it for, and is it worth building?
- Decision captured in writing

**Time estimate:** 1-2 hours (thinking, not coding)

---

# Timeline (Realistic)

| Phase | Weeks | Outcome |
|-------|-------|---------|
| 1: Trello Foundation | 1 | TrelloService extracted, config working |
| 2: Obsidian Foundation | 1-2 | Can write to vault from code |
| ~~3: Google Calendar~~ | ~~1-2~~ | ~~DESCOPED~~ |
| 4: The Bot | 2 | Working locally, Claude parsing |
| 5: Deploy | 1 | Live on Fly.io |
| 6: Polish | 2-3 | Vault sync, Telegram UX, daily digest, batch processing |
| 7: Learning System | 1 | Portable, enforceable learning infrastructure |

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

## External Project References (Future Review)

- OpenHands AGENTS.md + Skills model — instruction modularity and agent workflow structure:
  - `https://docs.all-hands.dev/modules/usage/prompting/agents-md`
  - `https://docs.all-hands.dev/modules/usage/prompting/skills`
- Continue prompt files — reusable prompt modules/frontmatter patterns:
  - `https://docs.continue.dev/customize/tutorials/prompt-files`
- n8n Telegram Trigger + Trello node — mature workflow reliability/retry patterns:
  - `https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/`
  - `https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.trello/`
- Obsidian Trello plugin — note/task bridge UX ideas:
  - `https://github.com/nathonius/obsidian-trello`
- Mem0 — AI memory indexing/retrieval patterns:
  - `https://github.com/mem0ai/mem0`
- FSRS4Anki — spaced repetition scheduling approach for quick-check evolution:
  - `https://github.com/open-spaced-repetition/fsrs4anki`

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
