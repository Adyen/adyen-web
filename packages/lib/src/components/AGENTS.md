# Payment Components

Self-contained payment method implementations extending `UIElement`. Each folder is one payment
method. Covers Card, Drop-in, and 3DS2 specifics at the bottom.

## Commands

| Task                          | Command                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Unit tests                    | `yarn --cwd packages/lib test [ComponentName]`                                                 |
| Type check                    | `yarn --cwd packages/lib type-check`                                                           |
| Strict TS scan, one component | `yarn workspace @adyen/adyen-web exec tsc -p tsconfig.strict.json 2>&1 \| grep -i [component]` |
| Lint                          | `yarn --cwd packages/lib lint`                                                                 |
| Lint styles                   | `yarn --cwd packages/lib lint-styles`                                                          |
| E2E                           | `yarn test:e2e tests/e2e/[component]/[component].spec.ts --project=chromium`                   |

## Boundaries

- **Owns**: every payment method folder plus `tx-variants.ts`, `components-map.ts`,
  `components-name-map.ts`, `index.ts`, `types.ts`, `utilities.ts`.
- **May read**: `internal/` (base class and shared primitives), `core/` types, `utils/`.
- **Never touches**: `core/core.ts`, or another payment method folder. No cross-imports between
  payment methods — if two need the same code, it belongs in `internal/` or `utils/`.

`UPI/`, `ApplePay/`, and `Card/` are the reference implementations — `UPI/` for a clean
straightforward component, `ApplePay/` for a wallet, `Card/` for the full SecuredFields path. Read
the closest one before building anything new.

## Component Folder Structure

```
[Component]/
├── [Component].tsx          # UIElement subclass (default export)
├── [Component]Component.tsx # Preact view (named export)
├── [Component].module.scss  # CSS Modules (new components)
├── [Component].test.tsx     # Unit tests
├── constants.ts
├── types.ts
├── stories/                 # Storybook stories
└── index.ts                 # Explicit named re-exports, never `export *`
```

`index.ts` is the only entry point external files may import from:

```ts
export { default } from './Component';
export type { ComponentConfiguration } from './types';
```

## Registering a New Payment Method

1. `tx-variants.ts` — add `[method] = '[method]'` to the `TxVariants` enum
2. `components-map.ts` — map `[TxVariants.method]: Component`
3. `components-name-map.ts` — map `[TxVariants.method]: 'Human Readable Name'` (used in warnings)
4. `index.ts` — `export { default as Component } from './Component';`

## Conventions

- `public static readonly type = TxVariants.[method]` is required on every UIElement subclass.
- `formatProps(props)` normalizes merchant config; `isValid` reports validity; `submit()` starts
  the payment. Validate config in `formatProps()` and throw `AdyenCheckoutError` with
  `IMPLEMENTATION_ERROR` for merchant mistakes.
- Wallets (ApplePay, GooglePay, AmazonPay) resolve availability in `isAvailable()`, never in the
  constructor, and lazy-load their third-party SDK via dynamic import. Their external SDK types
  live in colocated type files.

## Testing

- Build the core context with `setupCoreMock()` from
  `packages/lib/config/testMocks/setup-core-mock.ts`. Never use `global.core`, `global.i18n`, or
  `global.resources`. Access modules through `core.modules.i18n`, `core.modules.resources`,
  `core.modules.srPanel`, and pass those same instances to the `<CoreProvider>` /
  `<SRPanelProvider>` wrappers in your render helper.
- When you touch a test file that still uses the `global.*` pattern, migrate it as part of your
  change.
- Type mock responses explicitly — no implicit `any`. For service responses, use a plain inline
  type describing the mock shape (e.g. `{ payload?: string; resultCode?: string; error?: string }`)
  rather than fighting the production `ResultCode` union.
- Query by accessible role: `getByRole` with an accessible name → `getByLabelText` → `getByText` →
  keyboard/tab order. If an element is unreachable, that is an a11y gap — fix the markup with a
  semantic element, `<label>`, or ARIA attribute. Do not add a `data-testid` to make a test pass.

---

## Card

The largest component. Handles card payments through SecuredFields, plus BIN lookup, ClickToPay,
Fastlane, KCP, AVS, installments, stored cards, and the Bancontact variant.

### PCI architecture

Card data never enters the JavaScript context:

1. `SecuredFieldsProvider` (SFP) renders iframes hosted by `checkout.adyen.com`
2. SDK → iframe via `postMessage`: CSS variables, focus commands, validation triggers
3. iframe → SDK via `postMessage`: validity state, field completeness, error codes
4. On submit, encrypted card data goes from the iframe straight to Adyen

Never create custom card input fields, read iframe content, log iframe traffic, or persist card
data to storage or cookies.

### Conventions

- `CardElement.type` is `TxVariants.scheme`, not `card` — `scheme` is the canonical variant.
- `Bancontact.ts` extends `CardElement` with Bancontact-specific config.
- BIN lookup uses `triggerBinLookUp()` from `internal/SecuredFields/binLookup/`, returning the
  brand and supported brands.
- Dual branding: when a BIN matches multiple brands, render the brand selector and read the
  shopper's choice in `formatData()`.
- ClickToPay is opt-out — enabled by default, disabled with `_disableClickToPay: true`.
- When Card is embedded inside another component, set `_disableClickToPay: true` and
  `showPayButton: false` on the child.

### Notable defaults

| Flag                     | Default | Purpose                                  |
| ------------------------ | ------- | ---------------------------------------- |
| `doBinLookup`            | `true`  | BIN lookup for brand detection           |
| `_disableClickToPay`     | `false` | Disable ClickToPay                       |
| `showPayButton`          | `true`  | Render the pay button                    |
| `autoFocus`              | `true`  | Shift focus between fields automatically |
| `hasHolderName`          | `false` | Show the cardholder name field           |
| `billingAddressRequired` | `false` | Require a billing address (AVS)          |

`Card.tsx` sets `showFormInstruction`, `_disableClickToPay`, and `doBinLookup`; the rest are merged
from `CardInput/defaultProps.ts`.

---

## Drop-in

Orchestrates every payment method from the `/paymentMethods` response. It calls only the public
UIElement API — never a payment method's internals.

### Creation flow

```
DropinElement constructor
  → core.register(PaymentMethod) for each entry in paymentMethodComponents
  → on render:
    → splitPaymentMethods()          separates regular / stored / instant
    → createElements()               instantiates from the paymentMethods response
    → createStoredElements()         stored payment methods
    → createInstantPaymentElements() wallets, rendered above the list
    → filters.ts                     drops unavailable methods
    → getComponentConfiguration()    merges paymentMethodsConfiguration overrides
```

### Conventions

- `paymentMethodComponents` is merchant-supplied: they import the component classes and pass them
  in. Defaults to `[]`, so an empty Drop-in means the merchant passed nothing.
- `paymentMethodsConfiguration` holds per-method overrides, keyed by TxVariant:
    ```ts
    paymentMethodsConfiguration: {
        card: { hasHolderName: true },
        ideal: { showImage: false }
    }
    ```
- `instantPaymentTypes` accepts only `'googlepay'`, `'paywithgoogle'`, `'applepay'`; anything else
  is filtered out in `formatProps()`.
- `isValid` and `showValidation()` delegate to the active payment method.
- `handleAction()` builds a component from a payment action and renders it inside Drop-in;
  `componentFromAction` holds that reference until the flow finishes.
- Never hardcode payment method types — they all come from the response. Handle the case where a
  returned method has no registered component (warn via `components-name-map.ts`).
- Filter through `isAvailable()` before rendering, and don't break child mount/unmount lifecycles.

---

## 3D Secure 2

Security-critical. Two separate flows, both driven by an iframe from Adyen's 3DS2 server and
created by `Core.createFromAction()` when a response carries `action.type = 'threeDS2'`.

| Component                   | TxVariant                   | Purpose                                                     |
| --------------------------- | --------------------------- | ----------------------------------------------------------- |
| `ThreeDS2Challenge`         | `threeDS2Challenge`         | Visible challenge (password/OTP) for shopper authentication |
| `ThreeDS2DeviceFingerprint` | `threeDS2DeviceFingerprint` | Invisible fingerprint iframe for the frictionless flow      |

### Conventions

- `ThreeDS2Challenge` deliberately sends no `rendered` analytics event — it would share a
  timestamp with the "creq sent" event.
- Challenge `dataKey` defaults to `threeDSResult`.
- `DEFAULT_CHALLENGE_WINDOW_SIZE` in `constants.ts` controls iframe dimensions.
- `callSubmit3DS2Fingerprint.ts` owns fingerprint submission.
- `onComplete` routes to `onAdditionalDetails` in the native flow, or to a custom `onComplete` in
  the 3DS2-in-MD flow.
- Never read iframe content or log authentication data and challenge responses.
- Handle shopper abandonment — the challenge can time out. Test both frictionless and challenge
  paths.
