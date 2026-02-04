# Session Protocols

Load this file at session start and end.

## Start of Session

1. Claude reads CLAUDE.md + notes.md + task-plan.md
2. State where we left off
3. Confirm operating mode
4. Quick-check (below)
5. Begin

**Command narration rule:** Before Claude runs any terminal command, Claude explains what the command will do and why it's being run.

## Quick-Check Protocol

**When:** Every session start, before diving in.

**How:**

1. Claude picks ONE item from "Still Working Through" in notes.md
2. Claude asks a pointed question
3. Outcome:
   - **Nail it** → Moves to "Concepts Solidified"
   - **Miss it** → Stays, no stress
   - **Partial** → Quick teach, stays in list

**What counts as "nailing it":**

- Explain the *why*, not just the *what*
- Identify when to use it vs. alternatives
- Demonstrate understanding, not recite definitions

**What counts as "missing it":**

- "I don't know" (honest, useful)
- Reciting syntax without explaining purpose
- Confusing it with something else

## End of Session

**MANDATORY FILE UPDATES (like a linting hook — session cannot end without these):**

### 1. Update task-plan.md
- Mark completed tasks with ✅ prefix
- Add "Completed:" note with what was done
- Example: `### ✅ Task 2.1: ObsidianService scaffold`

### 2. Update notes.md
- Add progress entry under current phase section
- List what was built/learned
- Move concepts between "Still Working Through" ↔ "Concepts Solidified" based on user feedback
- Add new failure patterns to Bug Journal if observed

### 3. Ask user: "What feels solid? What's still fuzzy?"
- Fuzzy items stay in or move to "Still Working Through"
- Solid items move to "Concepts Solidified"
- **Graduation pass:** any concept *used correctly and explained* during session moves to "Concepts Solidified"

### 4. Commit all changes
- Stage task-plan.md, notes.md, and any code files
- Commit with descriptive message

### 5. State next starting point
- Which task is next
- Any prep needed

**Do NOT end session until steps 1-4 are complete.**

## Session Constraints

- Weekdays: ~2 hours max
- Weekends: ~4 hours max
- If a task won't fit in one session, break into checkpoint-sized pieces

## Doc Ownership

Claude drafts updates to task-plan.md and notes.md. Josh reviews and signs off.