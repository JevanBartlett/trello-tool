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

Task 1.10: Create a card

Add createCard(listId, name, description?) function
Create command: trello add-card <list-id> "Card name"
Done when: Card appears in Trello UI

Task 1.11: Move a card

Add moveCard(cardId, targetListId) function
Create command: trello move-card <card-id> <list-id>
Done when: Card moves between lists

Task 1.12: Archive a card

Add archiveCard(cardId) function
Create command: trello archive-card <card-id>
Done when: Card is archived

Week 4: Polish

Task 1.13: Error handling

Wrap API calls in try/catch
Display meaningful error messages
Handle network failures gracefully
Done when: Bad inputs show helpful errors, not stack traces

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

Project Complete.

Maintenance Notes
After completing all phases:

You've built something real
You've touched all 8 core skills
You have a reference project for future work
The tool is actually useful

Keep it running. Keep improving it. The learning doesn't stop.
