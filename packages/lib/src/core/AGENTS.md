# SDK Core

The engine that initializes checkout, manages sessions, resolves environments, orchestrates
analytics, and injects shared modules into every payment component. Also owns the merchant-facing
callback contract.

## Commands

| Task       | Command                              |
| ---------- | ------------------------------------ |
| Unit tests | `yarn --cwd packages/lib test core`  |
| Type check | `yarn --cwd packages/lib type-check` |
| Lint       | `yarn --cwd packages/lib lint`       |

## Boundaries

- **Owns**: `core.ts`, `AdyenCheckout.ts`, `types.ts`, `config.ts`, `utils.ts`,
  `core.registry.ts`, `core.defaultProps.ts`, and the `Analytics/`, `CheckoutSession/`,
  `Context/`, `Environment/`, `Errors/`, `ProcessResponse/`, `RiskModule/`, `Services/`
  subdirectories.
- **May read**: `components/internal/UIElement` (base class), `types/global-types.ts`, `utils/`.
- **Never touches**: individual payment method folders. Core stays payment-agnostic.

Do not modify Core to satisfy a single component. Propose a component-level solution first.

## Modules

| Module             | Responsibility                                                                 |
| ------------------ | ------------------------------------------------------------------------------ |
| `Analytics/`       | Event pipeline — info, log, and error events to the analytics endpoint         |
| `CheckoutSession/` | Session-based flow: creating and managing payment sessions                     |
| `Context/`         | Resources — image and asset URL resolution, `useImage`                         |
| `Environment/`     | Maps an environment name to API, analytics, and CDN URLs                       |
| `Errors/`          | `AdyenCheckoutError`, `CancelError`, and `SRPanel` screen-reader announcements |
| `ProcessResponse/` | Parses `/paymentMethods`, resolves payment actions and statuses                |
| `RiskModule/`      | Device fingerprinting for risk analysis                                        |
| `Services/`        | HTTP layer, sessions, payment and order status                                 |

## Key Interfaces

- `ICore` — the public contract for Core. Every UIElement receives it via constructor. Changing it
  is a breaking change.
- `CoreConfiguration` — merchant config (environment, locale, session, amount, callbacks).
- `CoreModules` — injected into components: `{ risk, analytics, resources, i18n, srPanel }`.

## Lifecycle

```
AdyenCheckout(config) → new Core(config) → core.initialize()
  → session setup (session-based flow only)
  → Analytics.setUp() — requests checkoutAttemptId
  → payment methods processing
  → ready for component creation
```

## Conventions

- `processGlobalOptions()` filters merchant config against the `GENERIC_OPTIONS` allow list.
- `assertConfigurationPropertiesAreValid()` warns on unknown `CoreConfiguration` properties. When
  you add a property to `CoreConfiguration`, add it to that function's `possibleFields` array too —
  the type helper is designed to fail the build if you forget.
- `Core.register()` / `registry.add()` maps `TxVariants` to component classes at runtime.
- `resolveEnvironments()` in `Environment/` maps an environment name to its URLs.
- Errors use `AdyenCheckoutError` with a typed code; `CancelError` is separate and represents
  shopper-initiated cancellation, not a failure.

## Callback Contract (Public API)

These are merchant integrations. Changing a signature, the timing, or the `state.data` shape is a
breaking change requiring a major version bump. Deprecate with a `console.warn()` first.

```
onChange() → shopper clicks Pay → validation passes → onSubmit(state, component, actions)
  → merchant calls actions.resolve(response)
    → resultCode Authorised/Received/Pending → onPaymentCompleted()
    → resultCode Refused/Cancelled/Error     → onPaymentFailed()
    → response.action present → handle action → onAdditionalDetails() → repeat
```

| Callback              | Invoked when                     | `state.data` carries                        |
| --------------------- | -------------------------------- | ------------------------------------------- |
| `onSubmit`            | Validation passed                | `paymentMethod`, `browserInfo`, `returnUrl` |
| `onAdditionalDetails` | 3DS2 / redirect / QR completed   | `details`, `paymentData`                    |
| `onPaymentCompleted`  | Authorised, Received, or Pending | Payment result                              |
| `onPaymentFailed`     | Refused, Cancelled, or Error     | Payment result                              |

Optional: `onError(error, component)` for network/config/action failures, `onChange(state,
component)` for field and validity changes, `onActionHandled(data)` once action UI is visible to
the shopper.

Action types to support: `redirect`, `threeDS2`, `qrCode`, `sdk`, `voucher`. For each — render UI,
collect data, keep `paymentData`, then call `onAdditionalDetails`.

## Analytics

- `Analytics.setUp()` requests the `checkoutAttemptId`. The initial `/analytics` call must not
  include `flavor`, `component`, or `containerWidth`.
- Send the flavor separately with `Analytics.sendFlavor('dropin' | 'components')` once a component
  is instantiated.
- `checkoutAttemptId` is cached in `sessionStorage` under `checkout-attempt-id` and reused only if
  it was created less than 15 minutes ago.
- `Analytics.flush()` sends immediately, bypassing debounce.

| Category | Debounce                             | Examples                                            |
| -------- | ------------------------------------ | --------------------------------------------------- |
| Info     | 10s in production, 5s in development | `clicked`, `rendered`, `selected`, `focus`, `input` |
| Log      | `DEFAULT_DEBOUNCE_TIME_MS` (300ms)   | `Submit`, `Action`, `Redirect`, `ThreeDS2`          |
| Error    | `DEFAULT_DEBOUNCE_TIME_MS` (300ms)   | `Network`, `ImplementationError`, `ApiError`        |

The container component owns analytics — don't emit events from internal primitives. Gate
event-sending on a `sendAnalytics = false` parameter so programmatic calls stay silent, and test
both paths. Never send PCI-sensitive data.

### Error codes are cross-SDK

`errorCodeMapping` here and `SF_ErrorCodes` / `ErrorCodePrefixes` in `Errors/constants.ts` use
numeric codes shared with the iOS and Android SDKs. The registry is
[`adyen-checkout-sdk-meta` → `alignment/AnalyticsErrors.json`](https://github.com/Adyen/adyen-checkout-sdk-meta/blob/develop/alignment/AnalyticsErrors.json).

Reuse an existing code where one fits, and never invent a number without checking that file for a
collision — no CI job catches it. New codes are registered there before being implemented here.

## Safety

- Never change `ICore` or a callback signature without a major-version plan.
- Never log PCI-sensitive data in analytics or error messages.
- Always use `AdyenCheckoutError` with `{ cause }` rather than a generic `Error`.
