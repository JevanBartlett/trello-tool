# /quick-check — Concept Drill Block

5-10 minute drill at session start. Josh writes real code. No freestyling — follow this spec.

---

## Select the Concept

Pick ONE item from `notes.md > Still Working Through`. Priority:

1. **Used in last session's code** — context is warm
2. **Needed for today's task** — pre-load before building
3. **Previously partial** — almost had it, new angle
4. **Oldest on the list** — don't let items go stale

Never drill the same concept the same way twice.

---

## Categorize It

| Category | Time | Covers |
|----------|------|--------|
| **Syntax/Operator** | 5 min | `??`, `?.`, destructuring, `instanceof`, `import type` |
| **API/Method** | 5-7 min | `Object.entries()`, `fs.readFile()`, `res.sendStatus()`, Express methods |
| **Pattern** | 7-10 min | Result pattern, error architecture, separation of concerns, middleware |
| **Mental Model** | 7-10 min | Generics, type guards, scoping, conditional types |

---

## Run the Format

### Syntax/Operator — "Use it or lose it"

1. **Setup (30 sec):** Realistic mini-problem, 2-3 sentences. Don't name the operator.
2. **Code (2-3 min):** "Write a snippet that solves this." Real code.
3. **Probe (1-2 min):** One of:
   - "Change the input to [edge case]. What happens?"
   - "Your coworker used [alternative]. What breaks?"
   - "Where in ctx would you use this?"

**Pass:** Correct code + explains behavioral difference vs. alternatives.
**Partial:** Code works but can't explain *why*, or misses the edge case.
**Miss:** Wrong operator or can't produce the code.

> **Example — `??`:** Config object where `timeout` might be `0`, `undefined`, or `null`. Write a one-liner that falls back to `30000` only when actually missing. Then: coworker wrote `config.timeout || 30000` — what value of timeout makes theirs wrong?

> **Example — destructuring in loops:** Object `{ chromium: 30000, firefox: 45000, webkit: 35000 }`. Write a loop that logs `"chromium: 30s"` per entry, destructuring in the loop header. Then: what does `Object.entries()` actually return?

---

### API/Method — "Write it cold"

1. **Task (30 sec):** Concrete 1-2 sentence task.
2. **Code (3-4 min):** "Write it from memory. No docs." Complete working snippet.
3. **Explain (1-2 min):** Point at 2-3 parts:
   - "What does this argument do?"
   - "What's the return type?"
   - "What happens if you leave this out?"

**Pass:** Working code from memory + explains each part.
**Partial:** Close but has a gap (wrong args, missing encoding) and explains some but not all.
**Miss:** Can't produce the code structure.

> **Example — `fs.readFile()` + `fs.writeFile()`:** Read `config.json`, add a `lastRun` timestamp, write it back. Full async function. Then: why `'utf-8'`? What without it? What if file doesn't exist?

> **Example — `exec` + `promisify`:** Function that runs `git status` from Node.js, returns output as string, async/await. Then: why promisify? Security difference between `exec` and `execFile`?

---

### Pattern — "Architect it"

1. **Scenario (1 min):** Realistic situation, 3-5 sentences. Don't name the pattern.
2. **Design (2-3 min):** "Show me function signatures, types, where responsibilities land." Real type definitions and stubs.
3. **Pressure test (2-3 min):** Introduce a complication:
   - "API returns 404 instead of 500. Does your structure handle it differently?"
   - "Second caller needs same data, different format. What changes?"
   - "Where does try/catch go? Show me."
4. **Connect (1 min):** "Where does this show up in ctx?"

**Pass:** Correct structure + explains *why* responsibilities land where they do + handles complication.
**Partial:** Roughly right but responsibilities misplaced, or can't handle complication.
**Miss:** Can't produce the structure, or everything in one layer.

> **Example — error architecture:** Function fetches Trello card by ID. API might return 404, 401, or network failure. CLI needs different messages for each. Write types and signatures for API layer and CLI layer. Then: Telegram bot handler also fetches cards — same API function? Same error handling?

> **Example — Result pattern:** Function validates input, calls API, transforms response. Any step can fail. Write `Result` type and function signature. Show caller's code. Then: why not just throw/catch?

---

### Mental Model — "Teach it back"

1. **Explain (2 min):** "Explain [concept] like I'm a dev who's never seen it. No jargon, no code yet."
2. **Predict (2-3 min):** Novel code snippet. "What does this produce? Walk through step by step."
3. **Build (3-4 min):** "Write a small example using this concept to solve [problem]." Real code.

**Pass:** Clear explanation + correct prediction with reasoning + working code.
**Partial:** Vague explanation, wrong prediction with partial reasoning, or code uses type assertions as crutch.
**Miss:** Can't explain mechanism, or prediction wrong with no reasoning.

> **Example — generics:** Explain what a generic type parameter does without using "generic." Then predict `T` in `wrap(42)`, `wrap("hello")`, `wrap([1,2,3])` for `function wrap<T>(value: T): { data: T }`. Then: write `firstOrDefault<T>` — array + default value, type-safe.

> **Example — type guards:** Why won't TS let you call `.toUpperCase()` on `string | number`? Then: write `formatValue` for `string | number | boolean` — strings uppercased, numbers 2 decimals, booleans "yes"/"no". No assertions.

> **Example — scoping:** Explain `let x` inside if-block vs assigning to outer `x`. Then predict output of `let` vs `var` in `for` loops with `setTimeout`. Why different?

---

## Score and Log

| Outcome | Action |
|---------|--------|
| **Pass** | Move to "Concepts Solidified" in notes.md |
| **Partial** | 60-sec correction: what was missing + one example. Stays in list. |
| **Miss** | Stays in list. No stress. |

Log in session's progress entry: `Drilled: [concept] → PASS/PARTIAL (gap)/MISS`

---

## Rules

1. **5-10 minutes. Hard stop.** Going long? Verdict and move on.
2. **Real code only.** Not "I would do X" — type it.
3. **Never same drill twice.** Same concept, different scenario.
4. **Don't soften scoring.** Correct syntax without explaining *why* = partial.
5. **One concept per drill block.** Depth over breadth.
6. **Log every drill.** Concept, category, outcome, gap if partial.
7. **Connect to ctx codebase when possible.**