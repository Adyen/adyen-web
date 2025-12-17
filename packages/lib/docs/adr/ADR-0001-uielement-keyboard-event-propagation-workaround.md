# UIElement Keyboard Event Propagation Workaround

## Context and Problem Statement

The `UIElement` class has a global `handleKeyPress` handler that triggers form submission on Enter key press. This conflicts with interactive buttons (e.g., `SegmentedControl`, `CopyButton`, Klarna's authorize button) that need their own Enter/Space key behavior without triggering payment submission. How do we prevent unintended form submissions while allowing buttons to handle their own keyboard events?

### Background: Merchant Integration via `onEnterKeyPressed`

The `handleKeyPress` method exists to support the [`onEnterKeyPressed`](https://github.com/Adyen/adyen-web/blob/main/packages/lib/src/components/internal/UIElement/UIElement.tsx#L479-L490) callback, which merchants can use to customize Enter key behavior. Any changes to `handleKeyPress` must ensure backwards compatibility with the `onEnterKeyPressed` API. Breaking this contract would require a **major version release (v7)**.

## Decision Drivers

- Pressing Enter/Space on interactive buttons should not trigger payment submission
- Minimal changes to avoid destabilizing the existing keyboard navigation flow
- Avoid breaking the expected Enter-to-submit behavior on form inputs

## Considered Options

- **Option 1:** Stop event propagation at the button level (current workaround)
- **Option 2:** Refactor `UIElement.handleKeyPress` to check event target context
- **Option 3:** Remove the global `handleKeyPress` handler and implement per-component submission triggers

## Decision Outcome

Chosen option: **"Option 1 - Stop event propagation at the button level"**

**Justification:** It is a localized fix that addresses the immediate problem without requiring a large refactor of `UIElement`. It allows affected components to opt-out of the global behavior on a case-by-case basis.

### Positive Consequences

- Low risk—changes are scoped to specific buttons
- No modification to core `UIElement` logic
- Easy to apply incrementally as issues are discovered

### Negative Consequences

- Requires manual application to each affected component
- Workaround pattern must be documented and understood by developers
- Does not address the root cause in `UIElement`

## Pros and Cons of the Options

### Option 1: Stop event propagation at button level

Uses [`stopPropagationForActionKeys`](https://github.com/Adyen/adyen-web/blob/main/packages/lib/src/components/internal/Button/stopPropagationForActionKeys.ts) utility to intercept Enter/Space keypresses.

**Affected files:**

- [`SegmentedControl.tsx`](https://github.com/Adyen/adyen-web/blob/main/packages/lib/src/components/internal/SegmentedControl/SegmentedControl.tsx#L61-L66)
- [`CopyButton.tsx`](https://github.com/Adyen/adyen-web/blob/main/packages/lib/src/components/internal/Button/CopyButton.tsx#L38-L40)
- [`KlarnaWidget.tsx`](https://github.com/Adyen/adyen-web/blob/main/packages/lib/src/components/Klarna/components/KlarnaWidget/KlarnaWidget.tsx#L84-L95)

* **Pros:**
    - Minimal code change per component
    - No risk to existing submission flows
    - Can be applied selectively
* **Cons:**
    - Scattered workaround logic across components
    - Easy to forget when adding new interactive buttons
    - Technical debt accumulates

### Option 2: Refactor UIElement.handleKeyPress to check target context

Modify [`UIElement.handleKeyPress`](https://github.com/Adyen/adyen-web/blob/main/packages/lib/src/components/internal/UIElement/UIElement.tsx#L471-L477) to inspect `e.target` and skip submission for non-input interactive elements.

- **Pros:**
    - Centralized fix—no changes needed in child components
    - Removes need for propagation workarounds
- **Cons:**
    - Risk of breaking existing expected behavior
    - Requires thorough regression testing

### Option 3: Remove global handleKeyPress, per-component triggers

Remove global keypress handling from `UIElement` and let each component explicitly bind Enter-to-submit only on relevant inputs.

- **Pros:**
    - Clean separation of concerns
    - Each component controls its own submission triggers
- **Cons:**
    - Large refactor affecting many components
    - Higher risk of missing submission triggers
    - Breaking change for components relying on current behavior

## Advice and Concerns

- When adding new interactive buttons or controls, apply `onKeyPress={stopPropagationForActionKeys}` and `onKeyDown={stopPropagationForActionKeys}` to prevent unintended form submission.
- A future refactor of `UIElement.handleKeyPress` (Options 2 or 3) should be deferred to **v7** since it would break the `onEnterKeyPressed` merchant API.
- Monitor for accessibility regressions—ensure Enter/Space still activates buttons correctly after stopping propagation.
