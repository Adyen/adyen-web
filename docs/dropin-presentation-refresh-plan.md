# Plan: Notify Drop-in when a payment method's presentation changes

## Problem

When Google Pay Accelerated Checkout fails to load, the component falls back to the standard
Google Pay button. The fallback updates `GooglePay.mode`, but the Drop-in UI keeps rendering the
payment method as "headerless", so the header stays visually hidden even though the accelerated
checkout iframe is gone.

## Root cause

The chain breaks at the boundary between the mutable `UIElement` instance and Preact's render tree:

1. `GooglePay.setMode()` mutates a plain class field (`this.mode`).
2. `PaymentMethodItem` reads `paymentMethod.showDropinHeaderWhenSelected` **during render**:

    ```tsx
    // packages/lib/src/components/Dropin/components/PaymentMethod/PaymentMethodItem/PaymentMethodItem.tsx
    const hideHeader = !paymentMethod.showDropinHeaderWhenSelected && isSelected;
    ```

3. Nothing in `DropinComponent`'s state changed, so Preact never re-renders that subtree.

Only the nested `GooglePayComponent` re-renders, because it owns its own `useState`. That is why the
button swaps but the headerless styling persists.

## Design

Add a generic "presentation changed" notification that flows
**child element -> Drop-in element -> DropinComponent state**, mirroring the existing
`setElementStatus` -> `elementRef.setStatus` -> `dropinRef.setStatus` pattern.

Decisions:

- The API is **generic on `UIElement`**, so any payment method can use it.
- `DropinComponent` re-renders via an explicit **state counter**, not `forceUpdate()`.
- The regression test asserts the **rendered Drop-in DOM**, not just the getter.

## Implementation steps

### 1. `packages/lib/src/components/Dropin/types.ts`

- Add `presentationVersion: number` to `DropinComponentState`.
- Add `refreshUI(): void` to the `IDropin` interface, so `assertIsDropin` consumers get
  type safety.

### 2. `packages/lib/src/components/Dropin/components/DropinComponent.tsx`

- Initialize `presentationVersion: 0` in state.
- Add the re-render trigger:

    ```ts
    public refreshUI = (): void => {
        this.setState(prevState => ({ presentationVersion: prevState.presentationVersion + 1 }));
    };
    ```

A state counter is preferred over `forceUpdate()` because it is explicit and easy to assert in tests.

### 3. `packages/lib/src/components/Dropin/Dropin.tsx`

Bridge the element to the mounted component:

```ts
public refreshPaymentMethods(): void {
    this.dropinRef?.refreshPaymentMethods();
}
```

### 4. `packages/lib/src/components/internal/UIElement/UIElement.tsx`

Add the generic notify hook. It is a no-op for standalone components, so it is safe for all payment
methods:

```ts
/**
 * Requests that Drop-in re-renders the payment method list, e.g. when a property that
 * affects presentation (such as showDropinHeaderWhenSelected) changes after mount.
 */
protected requestDropinRefresh(): void {
    if (assertIsDropin(this.elementRef)) {
        this.elementRef.refreshPaymentMethods();
    }
}
```

### 5. `packages/lib/src/components/GooglePay/GooglePay.tsx`

- Notify Drop-in from the single mode setter, guarding against redundant updates:

    ```ts
    private readonly setMode = (mode: GooglePaymentMode): void => {
        if (this.mode === mode) return;
        this.mode = mode;
        this.requestDropinRefresh();
    };
    ```

- Remove the stray `console.log` in `showDropinHeaderWhenSelected`. It violates the project logging
  convention and would ship to production.

## Testing

- Strengthen the existing Google Pay test to render through Drop-in and assert that
  `adyen-checkout__payment-method--headerless` and the visually hidden header class are removed after
  the accelerated checkout load fails. The current test only asserts the getter, so it passes despite
  the bug.
- Add a `DropinComponent` test covering `refreshPaymentMethods()` triggering a re-render.

## Verification

```bash
yarn --cwd packages/lib test GooglePay Dropin
yarn --cwd packages/lib lint
yarn --cwd packages/lib type-check
```

## Risks and notes

- `PaymentMethodDetails` is memoized, but its comparator only caches on deselection, so a Drop-in
  re-render **re-invokes `paymentMethodComponent.render()`**. Because `UIElement.render()` is wrapped
  by `createBeforeRenderHook`, each refresh emits an extra `rendered` analytics event. The equality
  guard in `setMode` keeps this to at most one extra event per real mode change; without it, the event
  would fire repeatedly.
- No infinite loop is possible: after switching to `STANDARD_BUTTON`, `GoogleAcceleratedCheckout`
  unmounts, so its `onFail` callback cannot fire again.
