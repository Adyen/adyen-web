# A11Y S6819: Replace ARIA Role Overrides with Semantic HTML

## Context and Problem Statement

Sonar rule [S6819] flags components that apply ARIA `role` attributes to generic HTML elements (e.g. `<div role="dialog">`, `<div role="region">`) where a native semantic element exists. The rule states that native elements provide better screen reader compatibility than ARIA role overrides. Which of these flags are legitimate fixes, which are false positives, and what is the safest remediation for each?

## Decision Drivers

- First rule of ARIA: use native HTML elements with built-in semantics before reaching for ARIA
- Contradictory ARIA usage (e.g. `role="img"` inside `aria-hidden` subtrees) must be fixed unconditionally
- Custom composite widgets (listbox/option) are a sanctioned ARIA pattern and cannot be replaced by native elements without losing functionality
- `<fieldset>` and `<form>` carry default browser styling and behaviour that must be verified before swapping
- `<dialog>` migration is a significant refactor (focus-trapping, open/close lifecycle) requiring its own scope

---

## Decisions by Component

---

### 1. `CVCHint.tsx` — `role="img"` on `<svg>`

#### Decision Outcome

Chosen option: **Remove `role="img"`**

**Justification:** `<svg>` elements with a `<title>` child already expose an accessible name to AT without an explicit role. Additionally, each SVG is toggled with `aria-hidden` — adding `role="img"` inside a conditionally hidden element is redundant. The `<title>` provides the accessible name when the SVG is visible; no role override is needed.

##### Positive Consequences

- Removes contradictory markup (role on a conditionally hidden element)
- Cleaner, spec-compliant SVG accessibility pattern

##### Negative Consequences

- None — AT experience is unchanged

---

### 2. `Timeline.tsx` — `role="img"` on decorative `<svg>`

#### Decision Outcome

Chosen option: **Remove `role="img"`**

**Justification:** The SVG is nested inside `<div aria-hidden="true">`, making it invisible to all AT. Applying `role="img"` inside an `aria-hidden` subtree is a contradiction — the role is never exposed to the accessibility tree. The SVG is purely decorative and carries no informational value.

##### Positive Consequences

- Eliminates contradictory ARIA (role inside aria-hidden)
- No meaningful change in AT output

##### Negative Consequences

- None

---

### 3. `Toggle.tsx` — `role="img"` on checkmark `<svg>`

#### Decision Outcome

Chosen option: **Remove `role="img"`**

**Justification:** The checkmark SVG is inside `<span aria-hidden={true}>`, the decorative track/handle of the toggle. The toggle's checked state is already communicated to AT via `<input role="switch" checked={checked}>`. The visual checkmark is purely decorative reinforcement of a state already announced by the input.

##### Positive Consequences

- Removes contradictory ARIA inside `aria-hidden` subtree
- Checked state remains correctly communicated via the `<input>`

##### Negative Consequences

- None

---

### 4. `SegmentedControlRegion.tsx` — `<div role="region">`

#### Context and Problem Statement

The component wraps a content panel associated with a `SegmentedControl` tab. It uses `<div role="region" aria-labelledby>` to expose it as a landmark region.

#### Considered Options

- **Option 1:** Replace with `<section aria-labelledby>`
- **Option 2:** Keep `<div role="region">` and suppress Sonar

#### Decision Outcome

Chosen option: **`<section aria-labelledby>`**

**Justification:** `<section>` is the native HTML equivalent of `role="region"`. When paired with `aria-labelledby`, it is exposed as a landmark region identically to `<div role="region">`. `<section>` is a block-level element with no default styling differences from `<div>`, so no CSS changes are needed.

##### Positive Consequences

- Complies with the first rule of ARIA
- No visual or behavioural change
- Clears the Sonar flag without suppression

##### Negative Consequences

- None

---

### 5. `IssuerButtonGroup.tsx` — `<div role="group">`

#### Context and Problem Statement

The component renders a group of issuer bank buttons. It uses `<div role="group" aria-label>` to semantically group them.

#### Considered Options

- **Option 1:** Replace with `<fieldset aria-label>`
- **Option 2:** Keep `<div role="group">` and suppress Sonar

#### Decision Outcome

Chosen option: **`<fieldset aria-label>`**

**Justification:** `<fieldset>` is the native HTML equivalent of `role="group"` for form controls. The component groups interactive buttons, which is exactly the semantic purpose of `<fieldset>`. `aria-label` is valid on `<fieldset>` (preferred over `<legend>` here since no visible label text is needed in the layout). Browser default styles for `<fieldset>` (`border`, `margin`, `padding`, `min-width: min-content`) are explicitly reset in `IssuerButtonGroup.scss` to preserve the existing flex layout.

##### Positive Consequences

- Native semantic grouping for AT without ARIA override
- Clears the Sonar flag

##### Negative Consequences

- Requires explicit fieldset CSS resets to prevent browser default styling

---

### 6. `SegmentedControl.tsx` — `<div role="group">`

#### Context and Problem Statement

The component renders a set of mutually exclusive toggle buttons. It uses `<div role="group">` to group them as a control set.

#### Considered Options

- **Option 1:** Replace with `<fieldset>`
- **Option 2:** Keep `<div role="group">` and suppress Sonar

#### Decision Outcome

Chosen option: **`<fieldset>`**

**Justification:** Same rationale as `IssuerButtonGroup` — `<fieldset>` is the native equivalent of `role="group"` for a set of related controls. No `aria-label` is added since the component has no accessible group label in its current design (the individual buttons carry their own labels via `aria-controls`/`aria-expanded`). Browser fieldset defaults (`border`, `margin`, `min-width`) are explicitly reset in `SegmentedControl.scss`; the existing `padding` declaration in the class already overrides the browser default padding.

##### Positive Consequences

- Native semantic grouping
- `aria-controls`/`aria-expanded` relationship between buttons and `SegmentedControlRegion` panels is preserved unchanged

##### Negative Consequences

- Requires explicit fieldset CSS resets

---

### 7. `SelectList.tsx` — `role="listbox"` on `<ul>`

#### Context and Problem Statement

The custom dropdown uses `<ul role="listbox">` to implement a fully custom select widget with icon support, secondary text, and disabled states — features unavailable in native `<select>`.

#### Considered Options

- **Option 1:** Replace with native `<select size=...>`
- **Option 2:** Keep `role="listbox"` and suppress Sonar

#### Decision Outcome

Chosen option: **Keep `role="listbox"`, suppress Sonar**

**Justification:** The ARIA spec explicitly defines the `listbox`/`option` pattern for custom select widgets. Native `<select>` cannot render icons, secondary text, or custom item layouts. The existing `eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role` comment already acknowledges this intentional ARIA usage. This is a **Sonar false positive**.

##### Positive Consequences

- No functionality lost
- Correct ARIA composite widget semantics maintained

##### Negative Consequences

- Requires inline Sonar suppression comment

---

### 8. `SelectListItem.tsx` — `role="option"` on `<li>`

#### Decision Outcome

Chosen option: **Keep `role="option"`, suppress Sonar**

**Justification:** Paired with `SelectList`'s `role="listbox"`. `listbox` + `option` is the canonical ARIA pattern for custom select widgets per the ARIA spec. This is the same false positive as SelectList — the two must be treated together as a composite widget.

---

### 9. `CardInput.tsx` — `<div role="form">`

#### Context and Problem Statement

The card input wrapper uses `<div role="form">` to expose it as a form landmark to AT. Sonar recommends `<form aria-label>` instead.

#### Considered Options

- **Option 1:** Replace with `<form aria-label>`
- **Option 2:** Keep `<div role="form">` and suppress Sonar

#### Decision Outcome

Chosen option: **TBD — pending Phase 4 implementation**

**Notes:** Replacing `<div>` with `<form>` introduces native `submit` event behaviour. The SDK payment flow is driven by `UIElement.submit()`, not a form submission — a native `submit` event (e.g. from pressing Enter in an input) could interfere. Mitigation: add `onSubmit={e => e.preventDefault()}`. Must be regression-tested against keyboard submission and the `onEnterKeyPressed` merchant API (see ADR-0001).

---

### 10. `Modal.tsx` — `<div role="dialog">`

#### Context and Problem Statement

The Modal component uses `<div role="dialog" aria-modal>` with a custom `useModal` hook for focus-trapping and open/close lifecycle management. Sonar recommends migrating to native `<dialog>`.

#### Considered Options

- **Option 1:** Migrate to native `<dialog>` with `showModal()`/`close()` API
- **Option 2:** Keep `<div role="dialog">` and suppress Sonar

#### Decision Outcome

Chosen option: **TBD — pending Phase 5 implementation**

**Notes:** Native `<dialog>` provides built-in focus-trapping, `::backdrop`, and `close`/`cancel` events that could replace significant portions of `useModal`. However, browser support and existing merchant-facing behaviour (focus management, dismiss on outside click) must be validated. This is the highest-risk change in this set and warrants its own PR.
