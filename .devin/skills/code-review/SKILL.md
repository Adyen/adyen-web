---
name: requesting-code-review
description: Pre-merge self-review that runs verification gates, performs an in-depth code review scanning for logic errors, security issues, type regressions, concurrency bugs, and refactoring opportunities, then generates a structured summary. Use after completing a feature, fixing a bug, or before requesting human code review.
---

# Requesting Code Review

Systematic pre-merge verification and in-depth code review. Run all gates, perform deep technical analysis on the diff, and generate a self-review summary.

## Role

Act as a Senior Staff Software Engineer and specialized Code Reviewer. Provide high-signal, actionable feedback to ensure correctness, security, performance, and maintainability.

## Core Review Principles (CRITICAL)

1. **Diff-Only Analysis:** Focus ONLY on added or modified lines. Do NOT comment on existing/legacy code that was not touched.
2. **No Speculation:** Do NOT report issues that are speculative or low-confidence. Base all conclusions on a complete understanding of the code.
3. **Prioritize Types:** Ignore basic styling (tabs, semicolons). Prioritize identifying TypeScript type regressions, `any` leaks, or weak interface definitions.
4. **Efficiency:** Call multiple tools in parallel when exploring the codebase. Focus on the impact of the specific changes.

## Step 1 — Automated Verification Gates

Run in order. Stop on failure and fix before continuing.

```bash
# Unit tests for the component
yarn --cwd packages/lib test [Component]

# Lint
yarn --cwd packages/lib lint
yarn --cwd packages/lib lint-styles

# Type check
yarn --cwd packages/lib type-check

# Strict TS scan — zero output expected
yarn workspace @adyen/adyen-web exec tsc -p tsconfig.strict.json 2>&1 | grep -i '[component]'

# E2E (if specs exist — Storybook auto-starts, no manual start needed)
yarn --cwd packages/e2e-playwright test:headless --project=chromium tests/e2e/[component]/
```

## Step 2 — PR Checklist Scan

Check each item from `.github/pull_request_template.md`:

1. Unit tests added for new/changed behavior?
2. Storybook stories added or updated?
3. Manually tested in playground?
4. No PII data in analytics events?
5. E2E tests passing + new tests if necessary?
6. All interfaces and types strictly typed?
7. Translation keys created and published (if applicable)?

Flag any unchecked items with a reason.

## Step 3 — In-Depth Code Review

Read the full diff and perform a deep technical review:

```bash
git diff origin/main --stat
git diff origin/main
```

### 3a. Technical Focus Areas

Scan the modified code for these high-priority issues:

- **Logic & Stability:** Logic errors, unhandled edge cases, potential null/undefined reference issues.
- **Concurrency:** Race conditions, improper `async/await` usage (floating promises), missing error handling in async flows.
- **Security & Resources:** Security vulnerabilities (OWASP top 10), resource leaks, improper API contract violations, PCI data exposure.
- **Caching:** Incorrect caching behavior, staleness issues, key-related bugs, ineffective invalidation.

### 3b. Pattern & Refactoring Analysis

Evaluate the modified code against these architectural patterns:

- **Early Returns (Guard Clauses):** Flatten nested `if-else` blocks by returning early.
- **Modern Async:** Replace `.then()/.catch()` chains with `async/await` and `try/catch`.
- **Complexity Reduction:** Identify functions with high cyclomatic complexity and suggest breaking into smaller, single-responsibility units.
- **Boolean Logic:** Simplify "double-negative" or overly complex boolean expressions.
- **Declarative Code:** Suggest `map`, `filter`, `reduce` over imperative `for` loops where clarity improves.
- **Clean Naming & Constants:** Flag generic names (`data`, `temp`, `result`). Identify magic numbers or hardcoded strings that should move to constants.
- **Utility Extraction:** Identify pure logic (formatting, transformations) that should move to `utils/` for better testability.

### 3c. Adyen Web-Specific Violations

- `console.log()` in production code (use `console.debug()` gated on `NODE_ENV`)
- `react` or `react-dom` imports (forbidden — use `preact`)
- Hardcoded credentials or API keys
- `@ts-ignore` without a description comment
- `export *` in `index.ts` files
- Inline styles or CSS-in-JS (use CSS Modules or BEM)
- Direct `.tsx` imports from external files (must import from `index.ts`)
- Missing `import type` for type-only imports

## Step 4 — Self-Review Summary

Generate a structured summary:

```markdown
### What Changed

[Brief description of the changes and motivation]

### What Was Tested

- **Automated**: [list of passing gates]
- **Manual**: [playground scenarios tested, if any]

### PR Checklist Status

- [x] Unit tests
- [x] Storybook stories
- [ ] Manual playground test — [reason if skipped]
      ...

### Review Findings

- **Critical** (fix now): [list or "None"]
- **Important** (fix before merge): [list or "None"]
- **Minor** (note for later): [list or "None"]

### Known Risks or Limitations

[Any caveats, deferred work, or edge cases not covered]
```

## Verification

The self-review is complete when:

- All automated gates pass with zero failures
- Every PR checklist item is checked or has a documented reason for being skipped
- The diff has been fully scanned for all technical focus areas and pattern issues
- All Critical findings have been fixed
