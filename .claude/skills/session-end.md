# Session End

Run this checklist when wrapping up a session. **Session cannot end until all steps are complete.**

## Per-Task Done Gate

If any tasks were completed this session, verify each one:

1. Run the code / verify it works
2. Done checks from task contract: all pass?
3. `notes.md`: what was learned? (even one line)
4. `task-plan.md`: mark complete with "Completed:" note

**Do not skip to end-of-session until these are confirmed for every completed task.**

## End of Session Steps

### 1. Update task-plan.md

- Mark completed tasks with a checkmark prefix
- Add "Completed:" note with what was done

### 2. Update notes.md

- Add progress entry under current phase section
- List what was built/learned
- Move concepts between "Still Working Through" and "Concepts Solidified" based on session work
- Add new failure patterns to Bug Journal if observed

### 3. Ask: "What feels solid? What's still fuzzy?"

- Fuzzy items stay in or move to "Still Working Through"
- Solid items move to "Concepts Solidified"
- Any concept used correctly AND explained during this session moves to "Concepts Solidified"

### 4. Stale Concept Graduation

Check "Still Working Through" in `notes.md` for stale items:

- If a concept has been there since 2+ phases ago AND was used correctly in code during those phases, flag it
- Say: "These concepts have been sitting in 'Still Working Through' since Phase N but you've been using them correctly: [list]. Ready to graduate any?"
- Each concept is tagged `[added: P<N>]` — compare against current phase

### 5. Commit all changes

- Stage `task-plan.md`, `notes.md`, `HANDOFF.md`, and any code files
- Commit with descriptive message

### 6. Update HANDOFF.md

- Fill in every field with current state
- If a field is empty (no blockers, no failed approaches), write "None"
- This is the first thing the next session reads — make it count

### 7. State next starting point

- Which task is next
- Any prep needed

## Doc Ownership

Claude drafts updates to `task-plan.md` and `notes.md`. Josh reviews and signs off.