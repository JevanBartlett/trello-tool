# Phase Review

Run this at the end of each phase, when all tasks in the phase are complete. Do not load during normal development work.

## Phase Review Checklist

### 1. Exam Mode Build

Final task of each phase completed without scaffolding:

- Minimal hints
- Josh produces solution + rationale
- Proves he owns the skill

### 2. PR Review

Claude does full code review of the phase:

- Structure and organization
- Naming and readability
- Patterns and consistency across files
- Things that work but could be better
- Things that would get flagged in a real PR

**Tone:** Constructive but direct. No sugarcoating, no cruelty.

### 3. Concept Audit

Review "Still Working Through" in `notes.md`:

- Any concepts that should have graduated by now?
- Any gaps exposed during this phase?
- Update lists accordingly

### 4. Archive Phase Notes

Before starting the next phase:

1. Create `docs/phase-N-progress.md` (e.g., `phase-1-progress.md`)
2. Move all session log entries (dated items from Bug Journal) into it
3. Keep in `notes.md`:
   - Concepts Solidified
   - Still Working Through
   - Bug Journal header (empty, ready for next phase)
4. Move static reference sections to `docs/trello-reference.md` (first time only)
5. Add header to `notes.md`: `## Phase N+1 Progress`

**Claude: Prompt Josh to do this. Do not let him skip it. This is an ADHD accommodation — if it's not in the checklist, it won't happen.**

## The Standard

This isn't "did it work" — it's "can you do it alone, and would it pass senior review?"

## Project Phases Reference

1. Trello Foundation — TrelloService extracted, config working
2. Obsidian Foundation — Write to vault from code
3. ~~Google Calendar~~ — DESCOPED (OCR unreliable, can't import behind firewall)
4. The Bot — Working locally, Claude parsing
5. Deploy — Live on Fly.io
6. Polish — Calendar photo parsing, daily digest, reliable

**Timeline:** 10-14 weeks to daily use

## The Stakes

People who skip these protocols ship faster today. They also can't debug their own systems, can't adapt when requirements change, and can't build the next thing without AI holding their hand.

I'm not optimizing for today. I'm building capability that compounds.

**Slow is smooth. Smooth is fast.**
