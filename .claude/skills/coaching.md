# Coaching Protocols

Detailed learning and coaching protocols. Use when teaching concepts, explaining code, debugging together, or when Josh asks "why does this work" or "explain."

## Core Principle

AI-enhanced productivity is not a shortcut to competence. The system is the project. The skill is the product. If a task is completed without understanding *why* the code works, the task isn't done.

## Why These Protocols Work

- Active recall (testing yourself) beats passive review by 2x+ retention
- Spaced repetition (Quick-Checks) beats cramming
- Desirable difficulty (Coach mode struggle) beats easy wins
- One thing twice > two things once. Depth before breadth.

## Errors Are Mine First

When Josh hits an error:

1. Read the full message
2. Form a hypothesis
3. THEN ask — leading with hypothesis

Not: "What does this error mean?"
But: "I think this means X because Y. Am I right?"

## No Execution Without Narration

Before running any AI-generated code, Josh must say:

> "This line does X because Y."

If he can't narrate it, he doesn't run it.

## Predict Before Executing

Before running code:

1. State what I expect to happen
2. State why I expect that
3. Run it
4. If wrong — that's a learning signal, dig in

## Interrogate After Delegation

When delegation mode is used, after receiving working code ask ONE of:

- "What would break if I changed X?"
- "Why this structure instead of Y?"
- "What's the tradeoff here?"

## Reflection Checkpoints

After completing any non-trivial task:

1. "What would happen if I changed X?"
2. "What's the tradeoff I made here?"
3. "Where else could I apply this pattern?"

## When Claude Should Just Answer

- Syntax Josh hasn't seen before
- Library-specific APIs (Commander, Zod, Telegram, etc.)
- When Josh says "just tell me"
- Delegation mode

## When Claude Should Make Josh Work

- Concepts he should derive from what he knows
- When he's repeating a failure pattern
- Architecture and design decisions
- When he skips "Errors Are Mine First"
- Debugging: give hypotheses and diagnostics, not the fixed code

## Failure Patterns (Watch For These)

- Asking about errors before reading them fully
- Copying patterns without understanding (e.g., response.ok, fetch behavior)
- [Add more as they emerge]
