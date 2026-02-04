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

1. Update task-plan.md with completion status
2. Add "Learned:" items to notes.md progress log
3. Add new failure patterns to learning-protocols.md if observed
4. Recap: "Here's what we covered. Which feel solid? Which are fuzzy?"
5. Fuzzy → "Still Working Through"
6. Solid → "Concepts Solidified"
7. Graduation pass: move any item that was *used correctly and explained* from "Still Working Through" → "Concepts Solidified"
8. State next starting point

## Session Constraints

- Weekdays: ~2 hours max
- Weekends: ~4 hours max
- If a task won't fit in one session, break into checkpoint-sized pieces

## Doc Ownership

Claude drafts updates to task-plan.md and notes.md. Josh reviews and signs off.