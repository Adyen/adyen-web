# Shared Internal Components

Payment-agnostic UI primitives and the base classes every payment component builds on. Changes
here ripple across all 60+ payment methods.

## Commands

| Task           | Command                                  |
| -------------- | ---------------------------------------- |
| Unit tests     | `yarn --cwd packages/lib test UIElement` |
| All unit tests | `yarn --cwd packages/lib test`           |
| Type check     | `yarn --cwd packages/lib type-check`     |
| Lint           | `yarn --cwd packages/lib lint`           |

## Boundaries

- **Owns**: `BaseElement/`, `UIElement/`, `SecuredFields/`, `FormFields/`, `Address/`,
  `ClickToPay/`, `PayButton/`, `Button/`, `QRLoader/`, `IssuerList/`, `Modal/`, `IFrame/`,
  `Await/`, `Voucher/`, `OpenInvoice/`, and the rest of the shared primitives.
- **May read**: `core/` types and modules (i18n, analytics, resources, errors), `utils/`.
- **Never touches**: individual payment method folders. No payment-specific logic here, ever.

**Extraction rule**: code moves here only once **3+ payment components** need it. A single-use
helper stays in its payment method folder.

## Class Hierarchy

`BaseElement` → `UIElement` → every payment method.

- `BaseElement` handles props merging and calls `formatProps()` **from its constructor** — so
  config is normalized before anything else runs. It also provides the default `formatData()`.
- `UIElement` adds the payment flow, analytics, rendering, status, and the pay button. Its
  constructor already calls `this.core.register(this.constructor)`, so subclasses get registry
  registration for free.
- `UIElement` is abstract — extend it, never instantiate it.

### Refs

- `componentRef` — the Preact view inside the UIElement (e.g. `CardInput` inside `Card`).
- `elementRef` — the UIElement subclass itself (e.g. `Card`, `Dropin`). Defaults to `this`, but a
  parent can pass its own so callbacks report the outer component.

### Subclass overrides

| Member                     | Required?                       | Purpose                                                                        |
| -------------------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| `static readonly type`     | Required                        | `TxVariants.[method]` registry identifier                                      |
| `componentToRender()`      | Required (`protected abstract`) | Return the Preact JSX to render                                                |
| `isValid` (getter)         | Override in practice            | Base returns `false`, so a component that doesn't override it can never submit |
| `formatProps(props)`       | Optional                        | Normalize merchant config                                                      |
| `formatData()`             | Optional                        | Shape the payment data for submission                                          |
| `isAvailable()`            | Optional                        | Async availability check, used by wallets                                      |
| `setStatus(status, props)` | Optional                        | Update visual state (loading/error/success)                                    |
| `showValidation()`         | Optional                        | Trigger validation UI                                                          |

`submit()` drives the whole flow — validate → `makePaymentsCall()` → `handleResponse()`. It is
inherited and rarely overridden; don't change it without understanding the full payment lifecycle.

## SecuredFields (PCI-critical)

- Card inputs render inside iframes served from `checkout.adyen.com`.
- Communication is `postMessage` only. Never reach into iframe content.
- `SecuredFieldsProvider` (SFP) orchestrates field creation, focus, validation, and styling.
- `triggerBinLookUp()` sends the leading 6–11 digits to identify the card brand.

## Testing

- Build core context with `setupCoreMock()` from
  `packages/lib/config/testMocks/setup-core-mock.ts`. Never use `global.core`, `global.i18n`, or
  `global.resources`. Access modules via `core.modules.*`.
- For spy-based a11y assertions, take `srPanel` from `setupCoreMock().modules.srPanel` — do not
  construct `new SRPanel(...)` yourself.
- Migrate any `global.*` usage you encounter in a test file you're already editing.
- Type mock responses explicitly; use a plain inline type matching the mock rather than the
  production union.
- Query by accessible role first (`getByRole` with an accessible name → `getByLabelText` →
  `getByText` → keyboard order). These primitives back every payment method, so an element that's
  unreachable by role or label is a real a11y bug affecting shoppers — fix the markup instead of
  adding a `data-testid`.

## Safety

- Never add payment-method-specific logic — this layer must stay payment-agnostic.
- Never break the `UIElement` constructor contract; every payment method depends on it.
- Always maintain WCAG 2.1 AA: semantic HTML, ARIA attributes, keyboard navigation, visible focus
  (`b-focus-ring` mixin).
- Always exercise a change against several payment methods — Card, GooglePay, and Redirect at
  minimum.
