# Adyen Web SDK

Payment UI SDK shipped to millions of shoppers. This file holds the conventions that apply
everywhere. Domain-specific context lives in the nearest `AGENTS.md`.

## Priority Stack

1. **Security & PCI compliance** — never expose payment data. Violation = merchant loses certification.
2. **Bundle size** — every KB matters.
3. **Backwards compatibility** — breaking changes need a major version bump + migration guide.
4. **Accessibility** — WCAG 2.1 AA. Screen reader and keyboard-only support required.
5. **Preact, not React** — wrong imports break production.

## Nearest-file precedence

A nested `AGENTS.md` overrides this file for code in its subtree. On conflict, follow the nested
one and treat the mismatch as a bug worth reporting. The Architecture map below marks which
directories have one.

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

`yarn build` runs lint, lint-styles, type-check, type emission, and rollup. It's slow and is not
part of normal verification — only reach for it when you need real build output.

### Verifying your work

Scope every check to what you actually touched. CI runs the full matrix — don't reproduce it
locally.

1. `yarn test <ComponentName>` — the affected unit tests
2. `yarn lint` and `yarn type-check`
3. **Touched a `.scss` file?** Run `lint-styles` (see the table above). No PR workflow runs
   stylelint — it executes only inside `yarn build`, so this local run is the only thing between a
   violation and a release.
4. Strict TS, filtered to your files — the one-file command in the table above. Two things to
   know: the CI gate compares the **repo-wide total** against `main`, so a clean grep of your own
   files doesn't guarantee a green check; and the scan is baselined, so pre-existing errors in a
   file you touched are not yours to fix. CI also comments when any single file gains errors, even
   if the total drops.
5. **E2E only for the component you changed**, chromium only:
   `yarn test:e2e tests/e2e/<component>/<component>.spec.ts --project=chromium`

Never run the whole E2E, visual, or a11y suite locally. They're slow, flaky outside CI, and the
visual suite needs platform-matched screenshots you won't have. On a PR, E2E is advisory; it
becomes blocking in the merge queue alongside unit tests, a11y, visual, locales, and the strict
scan.

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

Paths are relative to `packages/`. `◆` marks a directory with its own `AGENTS.md` — read it before
working there.

| Path                           |     | Purpose                                                       |
| ------------------------------ | --- | ------------------------------------------------------------- |
| `lib/`                         |     | The SDK                                                       |
| `lib/src/core/`                | ◆   | SDK engine, session, analytics, environments, callbacks       |
| `lib/src/components/`          | ◆   | Payment method implementations, plus Card, Drop-in, 3DS2      |
| `lib/src/components/internal/` | ◆   | Base classes (`BaseElement`, `UIElement`) and primitives      |
| `lib/src/utils/`               | ◆   | Shared helpers, plus general-purpose hooks                    |
| `lib/src/hooks/`               |     | Stateful hooks owning a domain (e.g. `usePaymentStatusTimer`) |
| `lib/src/styles/`              | ◆   | Design token generation and shared mixins                     |
| `lib/src/language/`            | ◆   | i18n runtime (copy lives in `packages/server/translations`)   |
| `lib/src/types/`               |     | SDK-wide shared types                                         |
| `lib/config/testMocks/`        |     | `setupCoreMock` and friends, used by every unit test          |
| `lib/storybook/`               | ◆   | Story infrastructure; also the E2E test target                |
| `lib/docs/adr/`                |     | Architecture Decision Records                                 |
| `playground/`                  | ◆   | Manual test/demo app                                          |
| `server/`                      |     | Mock API + translation files                                  |
| `e2e-playwright/`              | ◆   | Playwright E2E tests                                          |

### Where does new code go?

1. Specific to one payment method → `src/components/[Method]/`
2. Reused by 3+ components → `src/components/internal/`
3. Pure logic, no UI → `src/utils/`
4. A hook — general-purpose (`useIsMobile`) → `src/utils/`; owns a domain and its own state
   machine (`usePaymentStatusTimer`) → `src/hooks/`
5. SDK-wide concern → `src/core/` (propose a component-level solution first)

External files must import a component only through its folder's `index.ts`, never a `.tsx`
directly. Do not use `export *` in `index.ts` — it defeats tree-shaking. Four `internal/` folders
(`BrandImage`, `SegmentedControl`, `Tooltip`, `Timeline`) still do; they're known violations
awaiting migration, not precedent.

## Conventions

### Framework & language

- **Preact** — `import { h } from 'preact'`, hooks from `preact/hooks`. `react` and `react-dom`
  are forbidden; neither is a dependency, so an import fails to resolve rather than being caught
  by lint. `forwardRef` from `preact/compat` is the one import eslint blocks outright.
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
  invent — they come from a cross-SDK registry. See `src/core/AGENTS.md`.

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
- **No `console.log()` in shipped runtime code** — use `console.debug()` gated on `NODE_ENV`, or
  `console.warn()` for deprecations. Applies to `src/`; stories are exempt and use `console.log`
  deliberately, since `@storybook/addon-actions` isn't installed. No eslint rule enforces this.
  Never log PCI data to analytics.
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
implementations), check the constraints above, and ask. If you can't ask, state the assumption
explicitly in your summary rather than burying it in a diff. Record significant design decisions
as an ADR in `packages/lib/docs/adr/`.
