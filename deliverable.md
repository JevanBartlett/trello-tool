# Deliverable: Trello CLI Tool

## What This Tool Does

A command-line interface that connects to the Trello API to:
1. **Export** boards, lists, and cards to formatted markdown files
2. **Create** new cards on specified lists
3. **Provide context** for Claude about current work tasks (future use)

---

## Target User

Imran — a QA engineer learning TypeScript who wants to:
- Quickly dump Trello tasks to markdown for documentation/review
- Create cards from the terminal without opening Trello
- Eventually feed task context to Claude for assistance

---

## Commands (MVP)

### Export Command
```bash
trello export --board "FCO UAT task list" --list "Doing"
trello export --board "FCO UAT task list" --all-lists
trello export --board "FCO UAT task list" --list "Done*" --include-archived
```

**Output:** Markdown file with cards formatted like:
```markdown
# FCO UAT task list

## Doing

### Card Title
- **Due:** 2026-01-10
- **Labels:** bug, urgent

Description text here...

---

### Another Card
...
```

### Create Command
```bash
trello create --list "FCO Tasks" --title "Review PR #123"
trello create --list "FCO Tasks" --title "Fix login bug" --desc "Steps to reproduce..." --due "2026-01-15"
```

**Required:** `--list`, `--title`
**Optional:** `--desc`, `--due`

---

## Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Language | TypeScript | Learning goal |
| HTTP client | Native `fetch` | No extra dependencies, built into Node 18+ |
| CLI parsing | TBD (maybe Commander.js or manual) | Keep simple |
| Output format | Markdown files | Easy to read, version control friendly |
| Auth storage | `.env` file | Standard practice, gitignored |

---

## Success Criteria

1. Can authenticate with Trello API
2. Can list boards and see "FCO UAT task list"
3. Can export a single list to markdown
4. Can create a card and see it appear in Trello
5. Imran understands every line of code

---

## Future Enhancements (Not MVP)

- SQLite database for historical tracking
- Analytics: "How long do cards stay in Doing?"
- Pattern matching for list names (`Done*`)
- Integration with Claude for task context
