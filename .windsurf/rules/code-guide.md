---
trigger: always_on
---

# Adyen Web AI Ruleset

## Table of Contents
- [Persona & Philosophy](#persona--philosophy)
- [Project Architecture](#project-architecture)
- [Tech Stack & Constraints](#tech-stack--constraints)
- [Import Order & Organization](#import-order--organization)
- [Component Lifecycle (UIElement Pattern)](#component-lifecycle-uielement-pattern)
- [Coding Standards](#coding-standards)
- [State Management](#state-management)
- [Callback System Architecture](#callback-system-architecture)
- [Analytics Events](#analytics-events)
- [Error Handling](#error-handling)
- [Async/Await Patterns](#asyncawait-patterns)
- [Testing Strategy](#testing-strategy)
- [Build & Development](#build--development)
- [Security & PCI Compliance](#security--pci-compliance)
- [Bundle Size Discipline](#bundle-size-discipline)
- [Common Pitfalls](#common-pitfalls)

---

## Persona

### Priority Stack (in order)

1. **Security & PCI Compliance** — Never expose payment data. Violation = merchant loses certification.
2. **Bundle Size** — Every KB matters. Ships to millions globally.
3. **Backwards Compatibility** — Breaking changes = major version bump + migration guide.
4. **Accessibility (A11Y)** — WCAG 2.1 AA compliance. Screen readers and keyboard-only required.
5. **Preact-First** — This is NOT React. Wrong imports break production.

**Code Philosophy**: Defensive, Idempotent, Resilient, Testable.

---

## Project Architecture

### Directory Boundaries

| Directory | Purpose | Constraints |
|-----------|---------|-------------|
| `src/core/` | SDK engine | Touch ONLY for cross-cutting concerns. Changes affect ALL components. |
| `src/components/[PaymentMethod]/` | Payment implementations | NEVER import between payment methods. Self-contained. |
| `src/components/internal/` | Shared UI primitives | Extract here when logic reused by 3+ components. Payment-agnostic. |
| `src/utils/` | Pure functions | ZERO side effects. No DOM, no API calls, no state mutations. |
| `src/language/` | Translation system | Add keys to `packages/server/translations/[locale].json`. |

### Architectural Hierarchy

All payment components extend `UIElement`:
- `UIElement` (base) → `CardElement`, `DropinElement`, `[PaymentMethod]Element`

### Placement Decision Tree

1. Payment-method-specific? → `src/components/[Method]/`
2. Reused by 3+ components? → `src/components/internal/`
3. Pure logic with no UI? → `src/utils/`
4. SDK-wide concern? → `src/core/` (get approval first)

**Violations**: Importing between payment methods, UI in utils, API calls in utils, modifying core for single-component needs.

---

## Tech Stack & Constraints

### Framework: Preact (not React)

**Rules**:
- **DO** import `h` explicitly: `import { h } from 'preact'`
- **DO** import hooks from `preact/hooks`, NOT `react`
- **DO** use functional components with hooks for new code
- **DO NOT** use `forwardRef` from `preact/compat` (eslint-restricted)
- **DO NOT** import from `react` or `react-dom`

### TypeScript

**Configuration**: `strict: true` (with `noImplicitAny: false` and `strictNullChecks: false` for legacy compatibility)

**Rules**:
- **DO** use `interface` for object shapes (not `type` aliases)
- **DO** use explicit member accessibility (`public`/`private`) on class properties
- **DO** use `unknown` with type guards for external data
- **DO** define types in colocated `types.ts` files
- **DO NOT** use `@ts-ignore` without description comment

### Styling

#### New Code & Payment Methods: CSS Modules

For new components and payment methods, use CSS Modules (`.module.scss`):

**File naming**: `ComponentName.module.scss`

**Usage in component**:
```tsx
import styles from './ComponentName.module.scss';

<div className={styles.container}>
```

**Rules for CSS Modules**:
- **DO** use `@use 'styles/mixins'` for mixins
- **DO** use `@import 'styles/variable-generator'` for tokens
- **DO** use `token()` function: `padding: token(spacer-070)`
- **DO** use camelCase class names: `.bankList`, `.errorMessage`
- **DO** keep styles scoped and component-specific

#### Legacy Code Maintenance: BEM + Global SCSS

When maintaining existing components using global SCSS:

**Rules**:
- **DO** use BEM naming: `.adyen-checkout__[component]__[element]--[modifier]`
- **DO** use `token()` function: `color: token(color-label-primary)`
- **DO** use CSS variables for customization: `--adyen-sdk-[token-name]`
- **DO** support RTL with `[dir='rtl'] &` selectors
- **DO** use mixins from `styles/mixins.scss`

#### General Styling Rules
- **DO NOT** use inline styles or CSS-in-JS
- **DO NOT** mix CSS Modules and global SCSS in the same component

---

## Import Order & Organization

**Strict ordering (top to bottom)**:
1. Preact framework (`h`, hooks)
2. Third-party libraries (classnames, etc.)
3. Core/Utils (absolute imports)
4. Components (internal imports)
5. Types (`import type` statements)
6. Styles (SCSS — always last)

**Rules**:
- **DO** group imports with blank lines between categories
- **DO** use `import type` for type-only imports
- **DO NOT** use relative imports traversing more than 2 levels up

---

## Component Lifecycle (UIElement Pattern)

### Required Implementation

Every payment method extending `UIElement` must implement:
- `public static type = TxVariants.[method]` — Component registry identifier
- `formatProps(props)` — Normalize and validate configuration
- `isValid()` — Return current validity state
- `submit()` — Initiate payment flow

### Optional Overrides
- `isAvailable()` — Async check if payment method can be used
- `setStatus(status, props)` — Update visual state
- `showValidation()` — Trigger validation UI

### Payment Flow
```
submit() → makePaymentsCall() → handleResponse()
  → Success: onComplete()
  → Action Required: handleAction() → handleAdditionalDetails() → onComplete()
```

**Rules**:
- **DO** bind methods in constructor
- **DO** register component: `this.core.register(this.constructor)`
- **DO** validate props early, throw `AdyenCheckoutError` for misconfiguration
- **DO NOT** make API calls in constructor (use `isAvailable()`)
- **DO NOT** bypass `submit()` flow

---

## Coding Standards

### Component Structure
- **DO** use default exports for components
- **DO** define props interfaces above the component
- **DO** provide default values via destructuring
- **DO** colocate: `Component.tsx`, `Component.test.tsx`, `ComponentName.module.scss`, `types.ts`

### Event Handler Naming
- Props: `on[Event]` → `onClick`, `onChange`, `onSubmit`
- Implementations: `handle[Event]` → `handleClick`, `handleSubmit`
- **DO** use descriptive names: `handlePaymentSubmit` not `handleClick`
- **DO NOT** use generic names: `callback`, `handler`, `fn`

### Class Components (UIElement)
- **DO** use explicit member accessibility (`public`, `private`, `protected`)
- **DO** define `static type` for component registry
- **DO** implement `formatProps()` to normalize configuration

### Conditional Rendering
- **DO** use `&&` for single elements: `{isVisible && <Component />}`
- **DO** use ternary for either/or: `{isLoading ? <Spinner /> : <Content />}`
- **DO NOT** nest ternaries (extract to variable or function)

### Early Return Pattern
- **DO** use early returns for guard clauses
- **DO** handle exit cases first, then main logic
- **DO NOT** use deeply nested conditionals

### Immutability
- **DO** use immutable updates: `setState(prev => ({ ...prev, field: value }))`
- **DO NOT** mutate props or state directly

### Component Refs
- **DO** use `useRef` for DOM references in functional components
- **DO** check ref exists: `ref.current?.method()`
- **DO NOT** abuse refs — prefer props/callbacks for data flow

### Accessibility (A11Y)
- **DO** use semantic HTML (`<button>`, `<label>`, `<input>`)
- **DO** add ARIA attributes: `aria-label`, `aria-describedby`, `role`
- **DO** support keyboard navigation (Enter, Space, Escape, Arrow keys)
- **DO** provide focus indicators (`@include b-focus-ring` mixin)

### Localization
- **DO** use `i18n.get('key')` for all user-facing strings
- **DO** use descriptive keys: `card.number.label` not `cardNumber`
- **DO NOT** hardcode English strings

### JSDoc
- **DO** document public methods with `@param`, `@returns`, `@throws`
- **DO** mark internal APIs with `@internal`
- **DO NOT** document obvious code

### Configuration Validation
- **DO** validate config in `formatProps()` before render
- **DO** throw `IMPLEMENTATION_ERROR` for merchant mistakes
- **DO** normalize values (lowercase country codes, default timeouts)

### Debug & Logging
- **DO** use `console.debug()` gated with `process.env.NODE_ENV === 'development'`
- **DO** use `console.warn()` for deprecation notices
- **DO NOT** use `console.log()` in production
- **DO NOT** log PCI-sensitive data

### Custom Hooks
- **DO** prefix with `use`: `useFormValidation`, `useDebounce`
- **DO** follow hooks rules (top-level only, no conditionals)
- **DO** memoize returned functions with `useCallback`

### Performance
- **DO** use `useMemo` for expensive computations
- **DO** use `useCallback` for handlers passed to children
- **DO** lazy-load third-party SDKs
- **DO NOT** create inline functions in render

---

## State Management

### Functional Components
- **DO** use `useState` for local state
- **DO** use `useRef` for mutable values that don't trigger re-renders
- **DO** clean up effects in return function
- **DO** spread previous state: `setState(prev => ({ ...prev, field }))`

### Class Components (UIElement)
- **DO** use `setState()` method for state updates
- **DO** call `this.onChange()` after state updates
- **DO NOT** mutate `this.state` directly

---

## Callback System Architecture

### SDK Callback Contract (Public API)

Breaking callback changes require major version bump.

### Callback Lifecycle
```
onChange() → User clicks Pay → Validation passes → onSubmit(state, component, actions)
  → Merchant calls actions.resolve(response)
    → resultCode 'Authorised' → onPaymentCompleted()
    → resultCode 'Refused' → onPaymentFailed()
    → response.action exists → Handle action → onAdditionalDetails() → ...
```

### Required Callbacks

| Callback | When SDK Invokes | `state.data` Must Include |
|----------|------------------|---------------------------|
| `onSubmit` | After validation passes | `paymentMethod`, `browserInfo`, `returnUrl` |
| `onAdditionalDetails` | After 3DS2/redirect/QR completes | `details`, `paymentData` |
| `onPaymentCompleted` | `resultCode` is Authorised/Received/Pending | Payment result |
| `onPaymentFailed` | `resultCode` is Refused/Cancelled/Error | Payment result |

### Optional Callbacks
- `onError(error, component)` — Network/config/action failures
- `onChange(state, component)` — Form field/validation changes (debounce for text inputs)
- `onActionHandled(data)` — Action UI rendered to shopper

### Action Types to Handle
`redirect`, `threeDS2`, `qrCode`, `sdk`, `voucher`

For each action: render UI → collect data → store `paymentData` → invoke `onAdditionalDetails` → handle errors.

### Backward Compatibility Rules
- **DO** maintain callback signature
- **DO** deprecate with warning before removal
- **DO NOT** change callback timing without major version
- **DO NOT** change `state.data` structure

---

## Analytics Events

### Initialization
- Request `checkoutAttemptId` in `Core.initialize()` via `Analytics.setUp()`
- Initial `/analytics` request must NOT include `flavor`, `component`, `containerWidth`
- Send flavor via `Analytics.sendFlavor()` when component instantiated
- `checkoutAttemptId` valid for 15 minutes (stored in sessionStorage)

### Event Categories

| Category | Debounce | Sent To | Examples |
|----------|----------|---------|----------|
| **Info** | 10s prod / 5s dev | Internal only | `clicked`, `rendered`, `selected`, `focus`, `input` |
| **Log** | 5s | Logsearch, Looker | `Submit`, `Action`, `Redirect`, `ThreeDS2` |
| **Error** | 5s | Grafana, Logsearch, Looker | `Network`, `ImplementationError`, `ApiError` |

### Implementation Pattern
- **Container owns analytics** — Don't send from internal components
- **Flag parameter pattern** — Use `sendAnalytics = false` default
- **Arrow function methods** — Auto-binding when passing as props
- **configData for context** — Include relevant state
- **Test both paths** — User action fires, programmatic doesn't

### Rules
- **DO** call `this.submitAnalytics()` in UIElement subclasses
- **DO** use `Analytics.flush()` for immediate send
- **DO NOT** send PCI-sensitive data
- **DO NOT** reuse expired `checkoutAttemptId`

---

## Error Handling

### Error Types

| Type | Use Case |
|------|----------|
| `IMPLEMENTATION_ERROR` | Merchant misconfiguration |
| `NETWORK_ERROR` | API/fetch failures |
| `ERROR` | Generic runtime failures |
| `CancelError` | User-initiated cancellations |

### Rules
- **DO** wrap ALL async operations in try/catch
- **DO** use `AdyenCheckoutError` (not generic `Error`)
- **DO** include `{ cause: error }` to preserve stack
- **DO** implement retry with exponential backoff for network failures
- **DO** map error codes to user-friendly messages
- **DO NOT** use empty catch blocks
- **DO NOT** expose sensitive data in error messages

### Error Boundaries
- **DO** use for critical UI components with fallback UI
- **DO** log to analytics (without sensitive data)
- **DO** offer retry functionality
- **DO NOT** use for every component (performance cost)

Note: Error boundaries don't catch errors in event handlers or async code.

---

## Async/Await Patterns

### Rules
- **DO** use `async/await` over promise chains
- **DO** use `void` for fire-and-forget: `void asyncFn()`
- **DO** use `Promise.all()` for parallel independent operations
- **DO** always wrap in try/catch
- **DO NOT** mix async/await with `.then()/.catch()` in same function

---

## Testing Strategy

### Framework
Jest 29 + `@testing-library/preact` + `@testing-library/jest-dom`

### File Organization
- Colocate: `Component.test.tsx` next to `Component.tsx`
- Use `.test.ts` or `.test.tsx` suffix

### Test Structure
- **DO** use `describe` blocks to group related tests
- **DO** use `test` (not `it`)
- **DO** follow "should [expected behavior]" naming
- **DO** test user behavior, not implementation details

### Accessibility-First Query Priority
1. `getByRole` — ALWAYS prefer (matches screen readers)
2. `getByLabelText` — For form inputs
3. `getByPlaceholderText` — Only if no label
4. `getByText` — For non-interactive content
5. `getByTestId` — LAST RESORT

### Testing Rules
- **DO** use `userEvent` for interactions
- **DO** use `waitFor()` for async assertions
- **DO** test keyboard navigation and ARIA attributes
- **DO** test error states and edge cases
- **DO NOT** mock internal implementation (mock external APIs only)
- **DO NOT** use `global.core` and `global.i18n` from test setup

### Coverage
- **DO** maintain existing coverage levels
- **DO** write regression tests before fixing bugs
- **DO NOT** test third-party library behavior

---

## E2E Testing (Playwright)
### Framework
Playwright + `@axe-core/playwright` for accessibility testing
### File Organization
| Directory | Purpose |
|-----------|---------|
| `packages/e2e-playwright/models/` | Page Object Model classes |
| `packages/e2e-playwright/tests/e2e/[component]/` | Test specs grouped by component |
| `packages/e2e-playwright/tests/utils/constants.ts`| Shared test data |
| `packages/e2e-playwright/fixtures/` | Custom fixtures and URL mappings |

### Locator Priority (Accessibility-First)
- getByRole with regex — ALWAYS prefer: getByRole('textbox', { name: /first name/i })
- getByLabel — For form inputs with labels
- getByText — For static text content
- locator() with CSS — Only for component containers: .adyen-checkout__[component]

### Rules:
- **DO** Every payment component should have a corresponding model class extending 
- **DO** Store reusable test data in tests/utils/constants.ts:
- **DO** use case-insensitive regex: { name: /confirm purchase/i }
- **DO** scope locators to rootElement when possible
- **DO** use readonly for locator properties
- **DO** extend Base class for all page objects
- **DO** use custom fixtures for component instantiation
- **DO** group tests by component in describe blocks
- **DO** use descriptive test names: "should complete payment flow"
- **DO** reuse constants from tests/utils/constants.ts
- **DO** implement isComponentVisible() for each component
- **DO** use fillShopperData() helper for form population
- **DO NOT** hardcode test data in specs
- **DO NOT** use arbitrary waits — use waitFor conditions
- **DO NOT** use getByTestId unless absolutely necessary

---

## Build & Development

### Commands

| Command | Purpose |
|---------|---------|
| `yarn start` | Dev server with hot reload (localhost:3020) |
| `yarn start:storybook` | Component documentation |
| `yarn build` | Production bundles (CJS + ESM) |
| `yarn test` | Unit tests |
| `yarn test:e2e` | Playwright E2E tests |
| `yarn format` | Auto-fix formatting |
| `yarn size` | Check bundle size |

### Dependency Management
- **DO** check if feature exists in codebase first
- **DO** evaluate bundle size impact
- **DO** get explicit approval before adding
- **DO** always commit `yarn.lock` changes
- **DO NOT** add dependencies without approval
- **DO NOT** use `^` for critical runtime deps

### Immutable Installs
`yarn.lock` is source of truth. CI fails if lockfile differs. Guarantees identical builds across environments.

---

## Security & PCI Compliance

### PCI DSS Level 1

**Cardinal Rule**: NEVER access or store card data (PAN, CVV, PIN) in JavaScript context.

### SecuredFields Architecture

All card data flows through iframes hosted by `checkout.adyen.com`, never through main JavaScript.

**Communication**:
- Merchant → iframe: CSS variables, focus commands, validation triggers
- iframe → Merchant: Validity state, field completeness, error codes

**Rules**:
- **DO** use `SecuredFieldsProvider` for card inputs
- **DO** communicate via `postMessage` API only
- **DO NOT** access iframe content
- **DO NOT** create custom card input fields
- **DO NOT** use autocomplete for card fields
- **DO NOT** store card data in storage/cookies
- **DO NOT** log iframe communication

### XSS Prevention
- **DO** rely on Preact's automatic escaping
- **DO** whitelist protocols (https only)
- **DO NOT** use `dangerouslySetInnerHTML` without sanitization

### Data Logging

**Never log**: Card numbers, CVV, expiry dates, PINs, passwords, session tokens, API keys

**Safe to log**: Masked card numbers (`****1234`), payment method type, transaction status, error codes

### 3D Secure 2 (3DS2)
- **DO** use Native Flow (better UX)
- **DO** handle timeout gracefully
- **DO** test frictionless and challenge scenarios
- **DO NOT** skip 3DS2 for EU payments

### HTTPS
- **DO** enforce HTTPS for all payment flows
- **DO** reject insecure contexts (except localhost)

---

## Bundle Size Discipline

Every kilobyte matters. Ships to millions of merchants.

### Import Optimization
- **DO** import specific functions: `import debounce from 'lodash.debounce'`
- **DO** import specific icons: `import { CheckIcon } from './icons/CheckIcon'`
- **DO NOT** import entire libraries
- **DO NOT** use `import * as`

### Lazy Loading
Use dynamic imports for heavy dependencies and optional features.

---

## Critical Files

| File | Purpose | When to Touch |
|------|---------|---------------|
| `src/core/core.ts` | SDK singleton | Cross-cutting features only |
| `src/components/internal/UIElement/UIElement.tsx` | Base class | Extend, don't modify |
| `src/types/global-types.ts` | Shared types | Adding SDK-wide types |
| `src/styles/variable-generator.scss` | Design tokens | Use tokens, don't add |

---

## Common Pitfalls

### Framework
- Importing from React instead of Preact
- Forgetting `h` import
- Using `forwardRef` from `preact/compat`

### State
- Mutating state directly
- Inline functions in render causing re-renders

### Async
- Missing try/catch on async operations
- Using generic `Error` instead of `AdyenCheckoutError`
- Empty catch blocks
- Missing `void` keyword for fire-and-forget

### Styling
- Hardcoding strings instead of `i18n.get()`
- Wrong CSS class naming
- Inline styles
- Missing design tokens

### Testing
- Ignoring A11Y lints
- Using `getByTestId` instead of `getByRole`
- Testing implementation instead of behavior

### Security
- Logging PCI data in analytics
- Exposing sensitive data in errors

### Workflow
- Adding dependencies without approval
- Breaking changes without major version
- Manual version bumps
- Skipping changeset

---

## Execution Protocol

### Before Every Change
1. Identify architectural boundary (core/components/utils)
2. Study existing patterns (Card, ApplePay, GooglePay)
3. Validate approach (PCI, bundle size, A11Y constraints)

### During Implementation
1. Write test first
2. Follow import order
3. Use existing primitives from `src/components/internal/`
4. Validate early with `AdyenCheckoutError`

### After Implementation
1. `yarn test` must pass
2. `yarn size` — no significant increase
3. Test accessibility (screen reader, keyboard)
4. Create changeset

### When Uncertain
- STOP — Don't guess
- SEARCH — Find existing patterns in codebase
- STUDY — Look at similar implementations
- VALIDATE — Check constraints
- ASK — Request clarification
- NEVER — Ship code you wouldn't trust with your own payment data

---

## Non-Negotiables

1. **Security First** — Never log PCI data
2. **Accessibility Required** — A11Y lints must pass
3. **No Breaking Changes** — Without major version bump
4. **Bundle Size Matters** — Every KB counts
5. **Preact, Not React** — Wrong imports break production

**Violation = Rollback**

---

## ADR

**Location**: `packages/lib/docs/adr`

### Template

```markdown
### [Short Title]

#### Context and Problem Statement
{2-3 sentences. Articulate as question if helpful.}

#### Decision Drivers
* {driver 1}
* {driver 2}

#### Considered Options
* {option 1}
* {option 2}

#### Decision Outcome
Chosen option: **"{option}"**

**Justification:** {reasoning}

##### Positive Consequences
* {consequence}

##### Negative Consequences
* {consequence}

#### Pros and Cons of the Options

##### {option 1}
* **Pros:** {arguments}
* **Cons:** {arguments}
```

---

**Your Mission**: Deliver production-grade payment UI that merchants stake their business on.
