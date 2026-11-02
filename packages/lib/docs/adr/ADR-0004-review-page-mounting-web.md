# Web Review Page: Mounting Actions and Donations

## Context and Problem Statement

Follow-up to [ADR-0003](./ADR-0003-review-page-flow.md), which introduced the `onReview` callback and `checkout.processPayment(data)` for the review page flow.

Today, in the Sessions flow, the SDK mounts elements into DOM nodes it already owns:

- **Components** — the action replaces the component in `this._node`
- **Drop-in** — the action renders inside the Drop-in Preact tree via `componentFromAction`
- **Donation** — `DonationElement` auto-mounts once campaigns resolve

The review page breaks all three. The payment component is unmounted before the response is known, so the SDK would mount into a node that no longer exists and the shopper would never see the element. Merchants also reinitialise `AdyenCheckout` on the review route using the existing session ID, so the original `element` reference from `onPaymentCompleted` is no longer valid.

Two element types need to reach the merchant on the review page, and they are decided separately below because they have different backwards-compatibility constraints.

## Decision Drivers

- Must work in both Advanced and Sessions flow. In Sessions the SDK owns `handleAction`, so we cannot rely on the response-interception technique documented for the Advanced flow.
    - Scope note: `onAction` is dispatched from `UIElement.handleResponse` and from `core.processPayment`, so it covers both flows **while a component is mounted**. On an Advanced flow review page there is no component and no SDK-owned payment call, so the action is delivered manually via `checkout.createFromAction(action)` — see [ADR-0003](./ADR-0003-review-page-flow.md), "Advanced flow on web".
- Merchants who do **not** enable the review page must see no behaviour change.
- Must work when checkout is reinitialised on a new route, where the `element` reference is unavailable.
- Extensibility — the design should accommodate future "mountable elements".

---

## Decisions

### 1. Payment actions — `onAction(actionElement)`

#### Considered Options

- **Option 1:** `actionContainer` argument — `processPayment(data, { actionContainer })`, where `actionContainer` is an `HTMLElement | string`. The SDK stashes it and mounts every action of the flow into that node.
- **Option 2:** New top-level `onAction(actionElement)` callback. The SDK builds the element via `createFromAction` but does not mount it.
- **Option 3:** `onAction` passed per call — `processPayment(data, { onAction })`, receiving the raw action for the merchant to pass to `createFromAction` itself.

#### Decision Outcome

Chosen option: **"Option 2 — new `onAction(actionElement)` callback"**

**Justification:** The merchant can mount the element wherever it wants (modal, overlay, separate node), and can add analytics or navigation around it. Unlike Option 1 it is not limited to a single container per checkout instance and does not prevent the merchant from unmounting. Unlike Option 3 it does not require passing a callback on every `processPayment` call, including payments that never produce an action.

Internally `processPayment(data)` calls `session.submitPayment(data)` and then:

1. If the response contains an action (3DS2, QR code, redirect), builds a ready-to-mount `UIElement` via `createFromAction` and invokes `onAction(actionElement)`.
2. If the payment completes without an action, calls `onPaymentCompleted`.
3. On a partial payment / order split, calls `onOrderUpdated`.
4. On failure, calls `onPaymentFailed`.

If `onAction` is not configured but the response contains an action, the SDK fires `onError` with an `IMPLEMENTATION_ERROR` — otherwise the flow would stall silently.

```ts
// Review page — new instance from the existing session ID
const checkout = await AdyenCheckout({
    session: { id: existingSessionId },
    onAction: actionElement => {
        actionModalRef.current?.showModal();
        actionElement.mount(actionContainerNode);
    },
    onPaymentCompleted: result => { ... },
    onPaymentFailed: result => { ... }
});

// When the shopper clicks "Place order"
checkout.processPayment(reviewData);
```

##### Positive Consequences

- Merchant controls when, where, and how the action is mounted, and can unmount it
- No dependency on the original `element` reference, so it survives reinitialisation on a new route
- Multiple containers possible

##### Negative Consequences

- Adds a public callback to the API surface
- Merchant becomes responsible for the action component lifecycle

---

### 2. Donation — manual instantiation in `onPaymentCompleted`

#### Context

When the payment response carries `askDonation: true`, a `DonationElement` must reach the merchant. On the review page the previous mechanism cannot work: `element` is `undefined` when `onPaymentCompleted` is invoked from `core.processPayment`, leaving no way to obtain the `commercialTxAmount`.

#### Considered Options

- **Option 1:** Manual instantiation — merchant checks `result.askDonation` in `onPaymentCompleted` and constructs `Donation` with its own `checkout` reference. Requires making `commercialTxAmount` optional so the SDK can derive it from the session.
- **Option 2:** `onDonationAvailable` callback inside `DonationOptions`, receiving a ready-to-mount `DonationElement`.
- **Option 3:** Generic `onElementAvailable(element)` callback covering actions _and_ donation, replacing `onAction` entirely; merchant switches on `element.type`.

#### Decision Outcome

Chosen option: **"Option 1 — manual instantiation in `onPaymentCompleted`"**

**Justification:** Donation shipped recently. Introducing `onDonationAvailable` or `onElementAvailable` now would expand the public API surface and change already-released donation behaviour. A targeted, backwards-compatible change removes the blocker instead:

- `commercialTxAmount` is **optional** in `DonationCampaignOptions` (previously implicitly required).
- `DonationCampaignService` falls back to `checkout.options.amount?.value`, populated from the session setup response. This applies to `roundup` campaigns too.

On the review page the merchant creates a new `AdyenCheckout` with the existing session ID and instantiates `Donation` with a `rootNode`. The element detects service mode from the presence of `rootNode`, calls the sessions donation campaigns endpoint, and mounts itself once campaigns resolve.

```ts
const checkout = await AdyenCheckout({
    session: { id },
    donation: {
        onDonationSuccess: ({ didDonate }) => { ... },
        onDonationFailure: reason => { ... }
    },
    onPaymentCompleted: result => {
        // askDonation is present at runtime but not on PaymentCompletedData —
        // cast to PaymentResponseData to access it
        if ((result as PaymentResponseData).askDonation === true) {
            new Donation(checkout, { rootNode: '#donation-root' });
        }
    }
});
```

##### Positive Consequences

- Works on the review page with a small, backwards-compatible change
- No new SDK callback; no change to released donation behaviour
- Merchant controls when and where `Donation` is mounted

##### Negative Consequences

- Merchant must know to check `askDonation`, an internal response flag
- Merchant must import and instantiate `Donation` manually
- `askDonation` is absent from `PaymentCompletedData`, so a cast to `PaymentResponseData` is required

---

## Advice and Concerns

- **The two decisions above are deliberately inconsistent, and the inconsistency is the point of recording them together.** Actions get an SDK-provided callback; donation does not. This is justified by backwards compatibility for the recently released donation feature, not by design preference. Option 3 of the donation decision (`onElementAvailable`) would have subsumed `onAction` into a single "something needs mounting" contract — it was rejected for weaker typing, poor discoverability, and for mixing a _critical_ element (an unhandled action blocks the payment) with an _optional_ one (donation).
- Consequently, the "Extensibility" decision driver is only partially satisfied. Each future mountable element will face this same choice, and the per-element callback approach does not scale. If a third mountable element appears, revisit `onElementAvailable` and supersede this ADR rather than adding a third bespoke mechanism.

For more details refer to ADR-2623 and ADR-2652.
