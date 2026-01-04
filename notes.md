# Research Notes

## Progress Log

**2025-01-04:** Project setup complete
- GitHub repo created: https://github.com/JevanBartlett/trello-tool
- SSH key configured for GitHub authentication (ed25519)
- Initial commit pushed with project scaffolding
- Tools configured: TypeScript, ESLint, Prettier, Husky (pre-commit hooks)
- Next: Task 1.2 - Get Trello API credentials

---

## Trello API Authentication

**API Key vs Token - Key Distinction:**
- **API Key** = Identifies your *application* ("This request comes from Imran's Trello CLI tool")
- **Token** = Identifies the *user* AND *permissions* ("Imran authorized this app to read/write his boards")

You need BOTH to make requests. The token doesn't specify which board — it grants access to the user's account. Your code specifies which board in the API request.

**Where to get credentials:**
- API Key: https://trello.com/power-ups/admin
- Token: https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=YOUR_API_KEY

---

## Trello API Endpoints

*TODO: Research these endpoints and document the patterns*

- Get all boards for user: `???`
- Get lists on a board: `???`
- Get cards on a list: `???`
- Create a card: `???`

**Pattern observed:** (fill in after research)

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
