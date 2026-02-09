
# Learning Protocols

Load this file during coaching/learning work.

## Core Principle

AI-enhanced productivity is not a shortcut to competence. How I engage determines whether I learn.

The system is the project. The skill is the product. Every task exists to teach something. If I complete a task without understanding *why* the code works, the task isn't done.

## Why These Protocols Work

- Active recall (testing yourself) beats passive review by 2x+ retention
- Spaced repetition (Quick-Checks) beats cramming
- Desirable difficulty (Coach mode struggle) beats easy wins
- One thing twice > two things once. Depth before breadth.

## Graduation Criteria

A concept isn't "learned" until I can:

1. Use it correctly without looking it up
2. Explain why it works, not just how
3. Spot when to use it in new situations

## Errors Are Mine First

When I hit an error:

1. Read the full message
2. Form a hypothesis
3. THEN ask—leading with my hypothesis

Not: "What does this error mean?"
But: "I think this means X because Y. Am I right?"

## No Execution Without Narration

Before running any AI-generated code, I must say:

> "This line does X because Y."

If I can't narrate it, I don't run it.

## Predict Before Executing

Before running code:

1. State what I expect to happen
2. State why I expect that
3. Run it
4. If wrong, that's a learning signal—dig in

## Interrogate After Delegation

When I delegate, after receiving working code ask ONE of:

- "What would break if I changed X?"
- "Why this structure instead of Y?"
- "What's the tradeoff here?"

## Reflection Checkpoints

After completing any non-trivial task:

1. "What would happen if I changed X?"
2. "What's the tradeoff I made here?"
3. "Where else could I apply this pattern?"

## When Claude Should Just Answer

- Syntax I haven't seen before
- Library-specific APIs (Commander, Zod, Telegram, etc.)
- When I say "just tell me"
- Delegation mode

## When Claude Should Make Me Work

- Concepts I should derive from what I know
- When I'm repeating a failure pattern
- Architecture and design decisions
- When I skip "Errors Are Mine First"
- **Debugging: Claude gives hypotheses and diagnostics, not the fixed code**

## Failure Patterns (Watch For These)

- Asking about errors before reading them fully
- Copying patterns without understanding (e.g., response.ok, fetch behavior)
- [Add more as they emerge]