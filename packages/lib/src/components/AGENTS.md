# Payment Components

Self-contained payment method implementations extending `UIElement`. Each folder is one payment
method. Covers Card, Drop-in, and 3DS2 specifics at the bottom.

## Commands

| Task                          | Command                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Unit tests                    | `yarn test [ComponentName]`                                                                    |
| Type check                    | `yarn type-check`                                                                              |
| Strict TS scan, one component | `yarn workspace @adyen/adyen-web exec tsc -p tsconfig.strict.json 2>&1 \| grep -i [component]` |
| Lint                          | `yarn lint`                                                                                    |
| Lint styles                   | `yarn workspace @adyen/adyen-web lint-styles`                                                  |
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

This is the **target** layout for new components, not a description of the current tree — most
existing folders deviate, so match this rather than the folder next door:

```
[Component]/
├── [Component].tsx          # UIElement subclass (default export)
├── components/
│   └── [Component]Component.tsx  # Preact view (named export)
├── [Component].module.scss  # CSS Modules (new components)
├── [Component].test.tsx     # Unit tests
├── constants.ts
├── types.ts
├── stories/                 # Storybook stories
└── index.ts                 # Explicit named re-exports, never `export *`
```

Known deviations across the existing tree: `[Component]Component.tsx` always sits under
`components/` (never at the folder root), roughly 14 of ~78 payment-method stories use a
`stories/` folder while the rest sit at the folder root, and no reference component has a
`.module.scss` at its root.

`index.ts` is the only entry point external files may import from. Re-export the default UIElement
class explicitly (`export { default } from './Component';`) and add named `export type` lines only
for config types a merchant needs — `Card`, `UPI` and `ApplePay` all export the default alone.

Two standing exceptions, neither of which is precedent: `components-map.ts` and the barrel
`components/index.ts` reach into deep paths directly (`./Card/Bancontact`), and four `internal/`
folders (`BrandImage`, `SegmentedControl`, `Tooltip`, `Timeline`) still use `export *`.

## Registering a New Payment Method

1. `tx-variants.ts` — add `[method] = '[method]'` to the `TxVariants` enum
2. `components-map.ts` — map `[TxVariants.method]: Component`. This map feeds the UMD
   `createComponent` helper and the `PaymentMethods` type; runtime resolution on the ESM path goes
   through `core.registry` (auto-registered from the `UIElement` constructor) and Drop-in's
   `paymentMethodComponents`, so adding an entry here alone doesn't register anything at runtime.
3. `components-name-map.ts` — map `[TxVariants.method]: 'ComponentClassName'`. Despite the file
   name these are **component class names**, not display copy (`'WalletINElement'`,
   `'PayByBankUS'`). Two consumers: Drop-in's "make sure to import the Class X" warning, and
   `BaseElement`, which probes this map to classify a method as native vs generic in analytics
   `sdkData` — so omitting an entry silently changes analytics, it isn't cosmetic.
4. `index.ts` — `export { default as Component } from './Component';`

## Conventions

- `public static readonly type = TxVariants.[method]` is required on every UIElement subclass.
- `formatProps(props)` normalizes merchant config; `isValid` reports validity; `submit()` starts
  the payment. Validate config in `formatProps()` and throw `AdyenCheckoutError` with
  `IMPLEMENTATION_ERROR` for merchant mistakes.
- Wallets load their third-party SDK by injecting a `<script>` through `utils/Script`, not via a
  dynamic `import()` — no wallet uses `import()` today. Resolve availability in `isAvailable()`
  rather than the constructor: GooglePay and ApplePay override it, AmazonPay currently doesn't and
  inherits the base no-op. ApplePay is the cautionary case — it kicks off its SDK load from the
  constructor and `isAvailable()` merely awaits that promise, so "lazy" describes the check, not
  the fetch. Prefer GooglePay as the model for new wallets.

## Styling

Component styles live next to the component. `src/styles/` holds only token generation and shared
mixins — nothing component-specific goes there.

- New components use CSS Modules: `ComponentName.module.scss`, camelCase class names, imported as
  `import styles from './ComponentName.module.scss'`. Legacy components use global SCSS with BEM
  (`.adyen-checkout__[component]__[element]--[modifier]`). Modules are the direction of travel, not
  the norm yet — 7 of the 122 `.scss` files under `src/components/` are modules. Don't mix the two
  in one component (Card already does, via `DualBrandSelector.module.scss`; don't copy that).
- Reach shared SCSS through `@use` with a namespace, then call `variable-generator.token(...)`. A
  bare `token(...)` resolves only inside `variable-generator.scss` and will fail here. `@import` is
  deprecated and appears in no `.scss` file in this repo — keep it that way.
- Never hardcode a colour, spacing, or radius where a token exists, and never invent a token — they
  come from `@adyen/bento-design-tokens`.
- Check `styles/mixins.scss` before hand-writing focus rings, typography, breakpoints, or resets.
- Always support RTL with `[dir='rtl'] &` selectors.
- Never add `stylelint-disable` in new styles — fix the violation, or ask.

## Stories

New payment-method stories go in `[Component]/stories/`. Most existing ones sit at the folder root
as `[Component].stories.tsx` — either location is picked up, so don't relocate an existing story
just for consistency.

- Every story must wrap the element in `Checkout` (initializes Core from the story args) and then
  `ComponentContainer`, both from `storybook/components/`. `ComponentContainer` sets
  `globalThis.component`, which is what the Playwright suite drives — mount a UIElement directly
  and every E2E test for that component breaks, with no local signal that anything is wrong.
- For a component with an external pay button, keep the wrapper and hold your own reference to the
  instance, calling `submit()` on it from the button.
- Type stories with `MetaConfiguration<T>`, `StoryConfiguration<T>`, and
  `PaymentMethodStoryProps<T>` from `storybook/types.ts`.
- The story ID is `{kebab-meta-title}--{kebab-export-name}` — the `Cards` meta title plus a
  `Default` export gives `components-cards--default`, not `default`. The `URL_MAP.ts` fixture in
  `e2e-playwright` is keyed on the full ID, so renaming either the export **or** the meta title
  breaks the matching E2E test. Update both.
- Log callbacks with `console.log`. `@storybook/addon-actions` is **not installed**, so importing
  it fails to resolve. See `storybook/AGENTS.md` before reaching for an alternative.

## Testing

- Take the module instances from `setupCoreMock()` — `core.modules.i18n`, `core.modules.resources`,
  `core.modules.srPanel` — and pass those **same** instances to the `<CoreProvider>` /
  `<SRPanelProvider>` wrappers in your render helper. A second set of instances silently desyncs.
- When you touch a test file that still uses the `global.*` pattern, migrate it as part of your
  change.
- Type mock responses explicitly — no implicit `any`. For service responses, use a plain inline
  type describing the mock shape (e.g. `{ payload?: string; resultCode?: string; error?: string }`)
  rather than fighting the production `ResultCode` union.

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
- ClickToPay is opt-out at the flag level (`_disableClickToPay` defaults to `false`), but three
  further conditions gate whether it actually initializes: the guard reads the **raw constructor
  props**, so `new CardElement(core)` with no props argument skips it entirely; a `prepaid`
  `fundingSource` disables it; and `createClickToPayService` returns `null` unless the backend
  supplies the scheme DPA IDs. "Enabled by default" describes the flag, not the real behaviour.
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

`Card.tsx` sets `showFormInstruction`, `_disableClickToPay`, and `doBinLookup`. `showPayButton`
comes from `UIElement`'s own defaults, and the rest are merged from `CardInput/defaultProps.ts`.

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
        ↳ filters.ts                 drops unsupported, then unavailable, methods
        ↳ getComponentConfiguration() merges paymentMethodsConfiguration overrides
    → createInstantPaymentElements() wallets, rendered above the list
    → createStoredElements()         stored payment methods
    → fastlanePaymentElement         PayPal Fastlane, when present
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

| Component                   | Registry key                | `static type`         | Purpose                                                     |
| --------------------------- | --------------------------- | --------------------- | ----------------------------------------------------------- |
| `ThreeDS2Challenge`         | `threeDS2Challenge`         | `threeDS2Challenge`   | Visible challenge (password/OTP) for shopper authentication |
| `ThreeDS2DeviceFingerprint` | `threeDS2DeviceFingerprint` | `threeDS2Fingerprint` | Invisible fingerprint iframe for the frictionless flow      |

Note the fingerprint mismatch: it registers under `threeDS2DeviceFingerprint` (the key
`actionTypes.ts` looks up) but its `static type` — and therefore its analytics `component` field —
is `threeDS2Fingerprint`. Both enum members exist; don't "fix" one to match the other.

### Conventions

- Both components deliberately suppress the `rendered` analytics event by overriding
  `beforeRender()` with an empty body — the event would share a timestamp with "creq sent"
  (Challenge) and "threeDSMethodData sent" (fingerprint). A regression test covers this.
- Challenge `dataKey` defaults to `threeDSResult`.
- `DEFAULT_CHALLENGE_WINDOW_SIZE` in `constants.ts` controls iframe dimensions.
- `callSubmit3DS2Fingerprint.ts` owns fingerprint submission.
- `onComplete` routes to `onAdditionalDetails` in the native flow, or to a custom `onComplete` in
  the 3DS2-in-MD flow.
- Never read iframe content or log authentication data and challenge responses.
- Handle shopper abandonment — the challenge can time out. Test both frictionless and challenge
  paths.
