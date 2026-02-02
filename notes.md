# Research Notes

## Concepts Solidified
- Commander multiple arguments (`.argument()` chaining, `<>` vs `[]`)
- POST requests need method, headers, and body
- `JSON.stringify()` converts objects to JSON strings
- Optional TypeScript parameters (`param?: type`)
- PUT vs POST (PUT updates existing resources, POST creates new ones)
- `URL.searchParams.set()` for building query strings safely
- API parameter names must match documentation exactly
- Multi-step API workflows (board → list → card ID chains)
- Ternary for conditional values (`condition ? valueIfTrue : valueIfFalse`)
- `param: string | undefined` vs `param?: string` — Commander always passes args, use former
- `import type` vs `import` — use `import type` for types only used in annotations, regular `import` for runtime values (schemas)

## Still Working Through
- Commander `.option()` — options come as object in last callback parameter, different from `.argument()`
- `tsc` vs `tsx` — when to use which, what each actually does under the hood
- Error re-throwing — why `throw error` in catch blocks, how errors propagate
- TypeScript utility types — `Record<K, V>`, what others exist, when to use them
- `Object.entries()` — what it returns, how to use it
- Array destructuring in loops — `for (const [key, value] of ...)`
- Custom error classes — `extends Error`, public constructor params, calling `super()`
- Error handling architecture — where to throw (API layer) vs where to catch (CLI layer)
- `instanceof` for type-checking — how it works with class hierarchies
- `console.error()` vs `console.log()` — stderr vs stdout separation
- Separation of concerns — API module throws structured errors, CLI formats for user
- `?.` optional chaining — short-circuits to undefined when left side is null
- `??` nullish coalescing — fallback for null/undefined, watch operator precedence
- `Result<T>` pattern — returning `{ success: true, data }` or `{ success: false, error }` instead of throwing
- `safeParse` vs `parse` — safeParse returns result object, parse throws on failure
- Class constructor shorthand — `private param: type` in constructor declares + assigns property

## Bug Journal
When a meaningful bug occurs, log:
- Symptom
- Root cause
- How I found it
- Prevention (test, lint rule, type, invariant)

---

## Phase 2 Progress
