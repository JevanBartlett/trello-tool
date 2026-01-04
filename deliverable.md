Trello CLI Project — Deliverables
What This Document Is
This defines done for each phase. No ambiguity. No scope creep. When you hit these checkmarks, you move on.

Phase 1 Deliverable: Working CLI
You're done when:
bash# Authentication works
$ trello whoami
→ Josh (josh@example.com)

# Read operations work
$ trello boards
→ ID            NAME
→ abc123        Work Tasks
→ def456        Personal Projects
→ ghi789        Learning

$ trello lists abc123
→ ID            NAME
→ list001       To Do
→ list002       In Progress
→ list003       Done

$ trello cards list001
→ ID            NAME
→ card001       Fix login bug
→ card002       Write tests

# Write operations work
$ trello add-card list001 "New task from CLI"
→ Created card: card003 - "New task from CLI"

$ trello move-card card003 list002
→ Moved "New task from CLI" to "In Progress"

$ trello archive-card card003
→ Archived "New task from CLI"

# Errors are handled
$ trello cards nonexistent-id
→ Error: List not found (404)

# Help is useful
$ trello --help
→ (Shows all commands with descriptions)
Acceptance Criteria:

 CLI installs and runs with npm install && npx ts-node src/index.ts
 All 6 commands work: whoami, boards, lists, cards, add-card, move-card, archive-card
 Credentials stored securely in .env (not committed)
 Errors display helpful messages, not stack traces
 Code is in multiple files (not one giant file)
 Project has a README explaining setup

Files You'll Have:
trello-cli/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── trello-api.ts      # API wrapper functions
│   └── types.ts           # TypeScript interfaces
├── .env                   # Credentials (not committed)
├── .env.example           # Template for credentials
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

Phase 2 Deliverable: Persistent Storage
You're done when:
bash# Config persists
$ trello config set-default-board abc123
→ Default board set to "Work Tasks"

$ trello lists
→ (Shows lists for Work Tasks without specifying board)

# Cache is working
$ trello boards
→ (First call: ~500ms, hits API)

$ trello boards
→ (Second call: ~5ms, from cache)

$ trello boards --refresh
→ (Forces fresh API call)

# Local search works (if you did SQLite)
$ trello search "bug"
→ Found 3 cards matching "bug":
→   card001 - "Fix login bug" (Work Tasks / To Do)
→   card047 - "Debug CSS bug" (Work Tasks / Done)
→   card089 - "Bug bash notes" (Personal / Ideas)
Acceptance Criteria:

 Config file created at ~/.trello-cli/config.json
 Default board setting persists across sessions
 Cached data expires after 5 minutes
 --refresh flag bypasses cache
 (Optional) SQLite database stores boards/lists/cards
 (Optional) Search returns results in <100ms

New Files:
src/
├── cache.ts            # Caching logic
├── config.ts           # Config management
└── database.ts         # SQLite wrapper (if used)

Phase 3 Deliverable: HTTP API
You're done when:
bash# Server starts
$ npm run server
→ Server listening on http://localhost:3000

# Endpoints work
$ curl http://localhost:3000/health
→ {"status":"healthy","timestamp":"2024-01-15T10:30:00Z"}

$ curl http://localhost:3000/boards \
    -H "Authorization: Bearer your-token"
→ [{"id":"abc123","name":"Work Tasks"}, ...]

$ curl http://localhost:3000/boards/abc123/lists \
    -H "Authorization: Bearer your-token"
→ [{"id":"list001","name":"To Do"}, ...]

$ curl -X POST http://localhost:3000/lists/list001/cards \
    -H "Authorization: Bearer your-token" \
    -H "Content-Type: application/json" \
    -d '{"name":"Created via API"}'
→ {"id":"card999","name":"Created via API","listId":"list001"}

# Auth is enforced
$ curl http://localhost:3000/boards
→ {"error":"Unauthorized","code":401}

# Validation works
$ curl -X POST http://localhost:3000/lists/list001/cards \
    -H "Authorization: Bearer your-token" \
    -H "Content-Type: application/json" \
    -d '{}'
→ {"error":"name is required","code":400}
API Endpoints:
MethodPathDescriptionGET/healthHealth check (no auth)GET/boardsList all boardsGET/boards/:id/listsList lists in boardGET/lists/:id/cardsList cards in listPOST/lists/:id/cardsCreate cardPUT/cards/:id/moveMove card to listDELETE/cards/:idArchive card
Acceptance Criteria:

 Server starts with npm run server
 All 7 endpoints implemented and working
 Authorization header required (except /health)
 Invalid requests return 400 with clear message
 Not found returns 404
 Server errors return 500 and log details
 API.md documents all endpoints
 At least 3 endpoint tests pass

New Files:
src/
├── server.ts           # Express app entry
├── routes/
│   ├── boards.ts
│   ├── lists.ts
│   └── cards.ts
├── middleware/
│   ├── auth.ts
│   └── error-handler.ts
└── __tests__/
    └── api.test.ts

API.md                  # API documentation

Phase 4 Deliverable: Deployed Service
You're done when:
bash# App runs in Docker locally
$ docker build -t trello-api .
$ docker run -p 3000:3000 --env-file .env trello-api
→ Server listening on http://localhost:3000

# App is deployed
$ curl https://your-app.fly.dev/health
→ {"status":"healthy","timestamp":"2024-01-15T10:30:00Z"}

# Production API works
$ curl https://your-app.fly.dev/boards \
    -H "Authorization: Bearer your-token"
→ [{"id":"abc123","name":"Work Tasks"}, ...]

# Logs are visible
$ fly logs
→ (Shows request logs)
Acceptance Criteria:

 Dockerfile builds successfully
 App runs in container locally
 No secrets in code (all from environment)
 Deployed to Fly.io (or equivalent)
 HTTPS endpoint accessible from internet
 Health check responds
 Full CRUD works in production
 You can find and read logs

New Files:
Dockerfile
fly.toml               # Fly.io config
.dockerignore

Phase 5 Deliverable: LLM Integration
You're done when:
An LLM can successfully:

List your Trello boards
Show cards in a specific list
Create a new card
Move a card between lists

Tool Schema Example:
json{
  "name": "trello_list_boards",
  "description": "Get all Trello boards for the user",
  "parameters": {}
}

{
  "name": "trello_create_card",
  "description": "Create a new card in a Trello list",
  "parameters": {
    "listId": { "type": "string", "required": true },
    "name": { "type": "string", "required": true },
    "description": { "type": "string", "required": false }
  }
}
Acceptance Criteria:

 Tool schemas documented in tools.json
 Successfully tested with Claude (or another LLM)
 At least one real debugging session documented
 Project README updated with full setup instructions

New Files:
tools.json              # LLM tool definitions
DEBUG_LOG.md            # Document of issues you solved

Project Complete Checklist
When you've finished everything:

 All 5 phase deliverables met
 Code pushed to GitHub
 README explains the full project
 API is live and working
 You can demo it to someone in 5 minutes
 You can explain every major decision you made


What You've Proven
By completing this project, you've demonstrated:

You can consume APIs — Trello integration works
You can parse and transform data — JSON → useful output
You can handle authentication — API keys, tokens, headers
You can build a CLI — User-friendly command interface
You can build an API — HTTP server with routes
You can persist data — Cache, config, database
You can deploy — Live on the internet
You can debug across systems — Found and fixed real issues

You're a software developer. The project proves it.