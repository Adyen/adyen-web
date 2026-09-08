# Adyen Web SDK

Payment UI SDK shipped to millions of shoppers. This file holds the conventions that apply
everywhere. Domain-specific context lives in the nearest `AGENTS.md`.

## Priority Stack

1. **Security & PCI compliance** — never expose payment data. Violation = merchant loses certification.
2. **Bundle size** — every KB matters.
3. **Backwards compatibility** — breaking changes need a major version bump + migration guide.
4. **Accessibility** — WCAG 2.1 AA. Screen reader and keyboard-only support required.
5. **Preact, not React** — wrong imports break production.

## Dev Environment

- **Package manager**: Yarn 4 (corepack) — `corepack enable && yarn install`
- **Node**: 24.x (see `.nvmrc`)
- **Monorepo**: Yarn workspaces (`packages/*`)
- `yarn.lock` is the source of truth. CI runs `--immutable` and fails if the lockfile differs.

## Commands

Run from the repo root unless noted.

| Task                     | Command                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Install                  | `yarn install`                                                                              |
| Dev server (playground)  | `yarn start`                                                                                |
| Storybook                | `yarn start:storybook`                                                                      |
| Build library            | `yarn build`                                                                                |
| Unit tests               | `yarn test <pattern>`                                                                       |
| Unit tests with coverage | `yarn test:coverage`                                                                        |
| Lint                     | `yarn lint`                                                                                 |
| Lint styles              | `yarn workspace @adyen/adyen-web lint-styles`                                               |
| Type-check               | `yarn type-check`                                                                           |
| Strict TS scan           | `yarn validate:strict`                                                                      |
| Strict TS scan, one file | `yarn workspace @adyen/adyen-web exec tsc -p tsconfig.strict.json 2>&1 \| grep <file-name>` |
| E2E, one component       | `yarn test:e2e tests/e2e/<component>/<component>.spec.ts --project=chromium`                |
| Validate locales         | `yarn validate:locales`                                                                     |
| Bundle size              | `yarn workspace @adyen/adyen-web size`                                                      |
| Auto-fix formatting      | `yarn format`                                                                               |

**Port note**: the playground and Storybook both default to `3020`, so only one can run at a time.
Prioritize Storybook — it's what the E2E suite runs against.

### Verifying your work

Scope every check to what you actually touched. CI runs the full matrix — don't reproduce it
locally.

1. `yarn test <ComponentName>` — the affected unit tests
2. `yarn lint` and `yarn type-check`
3. Strict TS, filtered to your files:
   `yarn workspace @adyen/adyen-web exec tsc -p tsconfig.strict.json 2>&1 | grep <file-name>`.
   The scan is baselined, so you only need to avoid _adding_ errors — pre-existing ones in a file
   you touched are not yours to fix.
4. **E2E only for the component you changed**, chromium only:
   `yarn test:e2e tests/e2e/<component>/<component>.spec.ts --project=chromium`

Never run the whole E2E, visual, or a11y suite locally. They're slow, flaky outside CI, and the
visual suite needs platform-matched screenshots you won't have.

## Contribution Workflow

### Changesets

Any change under `packages/lib/src/**` needs a changeset.

Generating and validating one is owned by a dedicated skill — use it rather than writing the file
by hand, since the accepted prefixes and format are validated only in CI.

<!-- TODO: link the changeset skill here once it lands. -->

Never edit `package.json` versions by hand — Changesets owns that.

### Commits

A husky `pre-commit` hook runs `yarn validate:fix` (lint-staged), which **rewrites files**. If a
commit fails because of it, re-stage the modified files and commit again.

## Architecture

```
packages/
  lib/                  # The SDK
    src/core/           # SDK engine, session, analytics, environments
    src/components/     # Payment method implementations (+ their styles and stories)
    src/utils/          # Shared helpers, plus general-purpose hooks
    src/hooks/          # Stateful hooks with their own domain (e.g. usePaymentStatusTimer)
    src/styles/         # Design token generation and shared mixins
    src/language/       # i18n runtime (copy lives in packages/server/translations)
    src/types/          # SDK-wide shared types
    config/testMocks/   # setupCoreMock and friends, used by every unit test
    storybook/          # Story infrastructure; also the E2E test target
    docs/adr/           # Architecture Decision Records
  playground/           # Manual test/demo app
  server/               # Mock API + translation files
  e2e-playwright/       # Playwright E2E tests
```

### Where does new code go?

1. Specific to one payment method → `src/components/[Method]/`
2. Reused by 3+ components → `src/components/internal/`
3. Pure logic, no UI → `src/utils/`
4. A hook — general-purpose (`useIsMobile`) → `src/utils/`; owns a domain and its own state
   machine (`usePaymentStatusTimer`) → `src/hooks/`
5. SDK-wide concern → `src/core/` (propose a component-level solution first)

External files must import a component only through its folder's `index.ts`, never a `.tsx`
directly. Do not use `export *` in `index.ts` — it defeats tree-shaking.

## Conventions

### Framework & language

- **Preact** — `import { h } from 'preact'`, hooks from `preact/hooks`. `react` and `react-dom`
  are forbidden. `forwardRef` from `preact/compat` is eslint-restricted.
- **TypeScript** — `interface` for object shapes, `import type` for type-only imports, explicit
  `public`/`private` on class members, `unknown` + type guards for external data. Colocate types
  in `types.ts`.
- **Import order** — Preact → third-party → core/utils → components → `import type` → styles.
- **Exports** — `default export` for UIElement classes, named exports for Preact components.

### UIElement pattern

Every payment component extends `UIElement` and provides `static type` (a `TxVariants` value),
`formatProps()`, `isValid`, and `submit()`. Never make API calls from a constructor — use
`isAvailable()`. See `src/components/AGENTS.md`.

### Localization

Use `i18n.get('key')` for every user-facing string, with descriptive dot-notation keys
(`card.number.label`). Pass the **resolved string** to child components, not the key.

Translation copy is produced in a separate translations repo, not here. `en-US.json` is the source
of truth: add your new key to `packages/server/translations/en-US.json` so the feature works, and
let the translation process supply the other locales — they land as one batch commit across all
files. Treat every non-`en-US` file as generated output. Don't hand-write or machine-translate one
to fill a gap; it gets overwritten by the next batch, and until then it ships wrong copy.

### Error handling

- Use `AdyenCheckoutError`, never a generic `Error`. Pass `{ cause: error }` to preserve the stack.
- Codes: `IMPLEMENTATION_ERROR` (merchant mistake), `NETWORK_ERROR` (API/fetch), `ERROR` (runtime).
  `CancelError` is a separate type for shopper-initiated cancellation.
- Wrap async work in try/catch. No empty catch blocks. Never put sensitive data in a message.
- Numeric analytics error codes are shared with the iOS and Android SDKs and are **not** yours to
  invent — they come from a cross-SDK registry.

### Async

Prefer `async/await` over promise chains, and don't mix the two in one function. Use `void fn()`
for deliberate fire-and-forget and `Promise.all()` for independent parallel work.

### Testing

Jest + `@testing-library/preact`, colocated as `Component.test.tsx`. Use `describe` blocks and
`test` (not `it`), named `should [expected behavior]`. Query by accessible role first; treat an
unreachable element as an a11y bug in the component, not a reason to add `data-testid`. Build core
context with `setupCoreMock()` from `packages/lib/config/testMocks/setup-core-mock.ts` — never
`global.core` / `global.i18n` / `global.resources`. Write a regression test before fixing a bug.

## Safety Boundaries

- **PCI** — never read or store PAN, CVV, or PIN in JavaScript. Card data lives in SecuredFields
  iframes and is exchanged only via `postMessage`. Never log iframe traffic.
  Safe to log: masked numbers (`****1234`), payment method type, result codes.
- **No `react` / `react-dom` imports.**
- **No inline styles and no CSS-in-JS** — styling goes in a `.scss` file next to the component.
- **No hardcoded credentials** — API keys, secrets, and tokens must never appear in source.
- **No `console.log()` in production** — use `console.debug()` gated on `NODE_ENV`, or
  `console.warn()` for deprecations. Never log PCI data to analytics.
- **No suppression comments in new code** — `eslint-disable*`, `@ts-ignore`, `@ts-expect-error`,
  `@ts-nocheck`, `stylelint-disable`. Fix the underlying error. If one looks unavoidable, stop and
  ask.
- **No new dependencies without approval** — check for an existing utility first, then weigh the
  bundle cost. Import specific functions, never `import * as`. Lazy-load heavy third-party SDKs.
- **No public API changes without a plan** — callback signatures (`onSubmit`,
  `onAdditionalDetails`, `onPaymentCompleted`, `onPaymentFailed`), `state.data` shape, and the
  `ICore` interface are merchant contracts.
- **XSS** — rely on Preact escaping; no `dangerouslySetInnerHTML` without sanitization; allow
  `https` only.

## When Uncertain

Don't guess. Search for an existing pattern (`UPI/`, `ApplePay/` and `Card/` are the reference
implementations), check the constraints above, and ask. Record significant design decisions as an
ADR in `packages/lib/docs/adr/`.

## Pointers

- Nearest `AGENTS.md` — domain-specific commands, boundaries, and patterns.
- `.windsurf/skills/` and `.factory/skills/` — step-by-step procedures (new payment method,
  E2E test, Storybook story, TDD workflow, code review, PR description).
