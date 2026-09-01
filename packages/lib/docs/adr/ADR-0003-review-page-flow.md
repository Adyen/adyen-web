# Review Page Flow for Checkout SDKs

## Context and Problem Statement

The "Pay" button in Drop-in and Components immediately triggers the `/payments` call. Many merchants (Travel, Luxury, Grocery) need a final **review page** where the shopper verifies delivery dates, totals, and payment method before authorisation.

Web already supports this implicitly by letting merchants break out of `onSubmit` / `beforeSubmit`. iOS supports it only via a custom pay button, and Android effectively does not. How do we provide one flow that works across all platforms, with a good developer experience and reliable usage tracking?

## Requirements

- Works for both `/sessions` and Advanced flow. On web this holds for `onReview`, which fires before the flow branches; the SDK-provided submit (`processPayment`) is Sessions-only.
- Available for Drop-in **and** Components on web (Components only on mobile).
- Identical flow on iOS and Android, adoptable by cross-platform SDKs.
- Pay button label overridden with "Continue" when the mode is enabled.
- `state.data` must reach the merchant _before_ the payment is finalised.
- If the merchant backend returns an action (3DS2, QR code, redirect), the SDK must "wake up" and present it over the merchant's review page.
- Usage must be trackable; demo app example and documentation required.

## Decision Drivers

- **Platform alignment** — same behaviour on Android, iOS, and web
- **Developer Experience** — clear, guided integration with minimal confusion
- **Support Cost Reduction** — fewer misconfigurations means fewer support tickets
- **Future-Proofing** — clean separation so Advanced flow can eventually be deprecated without impacting Sessions merchants
- **Implementation Effort** — feasible within the next major release cycles

## Considered Options

- **Option 1:** Breaking out of the submit callbacks (today's web pattern)
- **Option 2:** Custom pay button + a `validate` function
- **Option 3:** Configuration property + explicit callback

## Decision Outcome

Chosen option: **"Option 3 — Configuration property + explicit callback"**

**Justification:** It is the only option that scores positively on platform alignment, developer experience, support cost reduction, and future-proofing simultaneously. It works with both the built-in and custom pay buttons, supplies extra information (e.g. card last four, up-to-date session details) through a dedicated callback, and requires no hidden-button or pre-fabricated-state juggling. Implementation effort is the sole driver where it does not lead, and the other benefits clearly outweigh it.

Option 1 was rejected as unintuitive, treating Advanced and Sessions differently, and allowing SDK initialisation with pre-fabricated state. Option 2 was rejected because it cannot use the built-in pay button and still requires exposing component state on web with no clear mechanism for additional information.

### Positive Consequences

- Advanced and Sessions flows are aligned
- Merchant is notified only when component state is valid for payment
- SDK owns the button label change ("Pay" → "Continue") and can emit a reliable `review` analytics event
- Additional data (card last four, session details) is easy to surface

### Negative Consequences

- New public callback (`onReview`) and new configuration surface
- On web, breaks the existing documented Advanced flow review page pattern
- On web, requires a new method to submit the payment in Sessions flow

## Pros and Cons of the Options

### Option 1: Breaking out of submit callbacks

Merchant signals in `onSubmit` (Advanced) or `beforeSubmit` (Sessions) that it wants to exit the flow, then carries payment state to the review page to re-initialise the SDK.

- **Pros:** works with custom and built-in button; notified only on valid state; no web implementation effort
- **Cons:** Advanced and Sessions differ; no mechanism for additional information; unintentional API; allows pre-fabricated state; analytics unreliable (usage must be assumed)

### Option 2: Custom button

Merchant hides the SDK pay button and renders its own; SDK exposes a `validate` function and the merchant carries component state to trigger submit.

- **Pros:** Advanced and Sessions aligned; no API abuse; intentional public API
- **Cons:** built-in button unusable; no mechanism for additional information; web must expose component state even while invalid; analytics unreliable

### Option 3: Configuration property + explicit callback

Merchant opts in via configuration; on button click the SDK fires `onReview` with component state plus additional information, and the merchant navigates to its review page and re-initialises the component there. ([Flow diagram](https://www.figma.com/board/QzxbaVv9VlbF8JZSIYEkl3/Review-Page---Flow-Diagram?node-id=0-1&p=f&t=dk6IHDekhbb3u5dU-0))

- **Pros:** all of Option 2's, plus built-in button support, SDK-driven button text, reliable tracking, easy additional information
- **Cons:** new callback and configuration; breaks existing web Advanced flow review pattern; needs a new Sessions submit method on web

## API Contract (Web)

When `onReview` is configured:

- The shopper clicks Continue with a valid state, `submit()` calls `onReview(state, component, reviewDetails)` and **returns immediately — no payment call is made**. The merchant renders its review page and must call `checkout.processPayment(state)` to resume.
- When a partial payment order is in progress, the SDK fetches the order status first and passes it as `reviewDetails.orderStatus`. If that call fails, `onReview` is still invoked with an empty `reviewDetails` object so the flow is never blocked.
- The SDK automatically relabels the Pay button to **"Continue"** and hides the payment method icon; no merchant configuration needed.
- A `review` analytics event is fired, enabling tracking of review page usage.

```typescript
onReview?(state: PaymentData, component: UIElement): void;

// Sessions flow only — errors in Advanced flow.
// Calls session.submitPayment internally and handles the full response lifecycle:
// onPaymentCompleted / onPaymentFailed, onAction, and core.update + onOrderUpdated
// when there is a remaining amount.
public processPayment(data: PaymentData): void;

// Fires when an action (redirect, 3DS2, QR code) must be presented after
// processPayment resolves. The merchant mounts the received element.
// Decided in ADR-0004.
onAction?(actionElement: UIElement): void;
```

How actions and donations are handed to the merchant on the review page is decided in [ADR-0004](./ADR-0004-review-page-mounting-web.md).

`PaymentData` carries `paymentMethod` (plus optional `checkoutAttemptId`), `browserInfo`, `riskData`, `order`, `clientStateDataIndicator`, `sessionData`, `storePaymentMethod`, `billingAddress`, `deliveryAddress`, `socialSecurityNumber`, `installments`, `shopperEmail`, `shopperName`, `telephoneNumber`, `dateOfBirth`, `bankAccount`, and `beneficiaryId`.

Mobile equivalents: iOS exposes `onReview = (_ data: PaymentComponentData) -> Void` and `processPayment(data:)`; Android is TBD.

### Advanced flow on web

`processPayment` is **Sessions-only**, and extending it to the Advanced flow was considered and rejected:

- In the Advanced flow the SDK never owns the `/payments` call, so there is nothing for `processPayment` to invoke. It would have to call back into `onSubmit`.

Advanced flow merchants are therefore unaffected and keep the existing pattern: perform the `/payments` call from the review page, and mount any returned action with `checkout.createFromAction(action)`. `onReview` still fires, so the review page itself is identical in both flows.

## Advice and Concerns

- **Unsupported payment methods.** The following bypass `onReview` to avoid interrupting their native flows: **Apple Pay, Google Pay, AmazonPay, PayPal, Klarna (widget), ANCV, PayByBankPix**.
    - Apple Pay / Google Pay / AmazonPay: the payment must complete while their overlay is open, so data cannot be carried to a review page.
    - PayPal: possible in **Advanced flow only**, not Sessions ([explanation](https://hub.is.adyen.com/engineering/platform/payments/checkout/web/a-developers-guide-to/paypal#qa)).
    - Klarna widget: the Klarna SDK owns the full UX; interrupting it disconnects the widget from its internal state machine.
    - ANCV: overrides `submit()` for an order-creation step before the payment call, bypassing the `onReview` check.

For more details refer to ADR-2482.
