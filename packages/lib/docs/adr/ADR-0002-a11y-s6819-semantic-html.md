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

Chosen option: **Keep `role="listbox"`, dismiss via SonarCloud UI**

**Justification:** The ARIA spec explicitly defines the `listbox`/`option` pattern for custom select widgets. Native `<select>` cannot render icons, secondary text, or custom item layouts. The existing `eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role` comment already acknowledges this intentional ARIA usage. This is a **Sonar false positive**.

**Suppression approach:** Dismiss the issue directly in the SonarCloud UI (mark as "Won't Fix" / "False Positive") rather than adding code-level suppression comments or `sonar-project.properties` entries. If the UI dismissal is not persistent across re-scans, fall back to a `sonar.issue.ignore.multicriteria` entry scoped to `**/Select/components/SelectList.tsx`.

##### Positive Consequences

- No functionality lost
- Correct ARIA composite widget semantics maintained
- Source files remain clean (no suppression comments)

##### Negative Consequences

- UI dismissal must be re-applied if the issue resurfaces after a branch reset or project re-key

---

### 8. `SelectListItem.tsx` — `role="option"` on `<li>`

#### Decision Outcome

Chosen option: **Keep `role="option"`, dismiss via SonarCloud UI**

**Justification:** Paired with `SelectList`'s `role="listbox"`. `listbox` + `option` is the canonical ARIA pattern for custom select widgets per the ARIA spec. This is the same false positive as SelectList — the two must be treated together as a composite widget. Same suppression approach applies: dismiss in the SonarCloud UI first, fall back to `sonar.issue.ignore.multicriteria` scoped to `**/Select/components/SelectListItem.tsx` if needed.

---

### 9. `CardInput.tsx` — `<div role="form">`

#### Context and Problem Statement

The card input wrapper uses `<div role="form">` to expose it as a form landmark to AT. Sonar recommends `<form aria-label>` instead.

#### Considered Options

- **Option 1:** Replace with `<form aria-label>`
- **Option 2:** Keep `<div role="form">` and suppress Sonar

#### Decision Outcome

Chosen option: **`<form name="cardPayment" onSubmit={e => e.preventDefault()}>`**

**Justification:** `<form>` is the native equivalent of `role="form"`. Sonar accepts `<form name=...>` as a compliant alternative, which avoids the need for a new i18n key or importing `useCoreContext` into `CardInput` (which does not currently use it). The `name` attribute satisfies the Sonar rule and exposes the form landmark to AT.

The `onSubmit={e => e.preventDefault()}` guard is added as a safety net against native form submission. In practice, no native submit path exists — the pay button is rendered outside this wrapper and the SDK payment flow is driven by `UIElement.submit()` — but the guard ensures robustness against any future changes (e.g. adding an `<input type="submit">` inside the wrapper).

`CardInput` does not use `useCoreContext`, so `aria-label` with an i18n string was ruled out to avoid adding a new dependency and a new translation key for something a `name` attribute handles equivalently.

##### Positive Consequences

- Native `<form>` landmark exposed to AT without ARIA override
- No new imports or translation keys needed
- `onSubmit` guard prevents any accidental native submission

##### Negative Consequences

- `<form>` introduces a new implicit landmark — screen readers will announce "form" on focus, which is the intended behaviour but is a minor AT experience change
- Regression testing against ADR-0001's `onEnterKeyPressed` merchant API is required

---

### 10. `Modal.tsx` — `<div role="dialog">`

#### Context and Problem Statement

The Modal component uses `<div role="dialog" aria-modal>` with a custom `useModal` hook for focus-trapping and open/close lifecycle management. Sonar recommends migrating to native `<dialog>`.

#### Considered Options

- **Option 1:** Full native `<dialog>` migration — replace `useModal`/`useTrapFocus` with `showModal()`/`close()`, use `::backdrop` for overlay
- **Option 2:** Minimal native `<dialog>` migration — use `<dialog>` element with `showModal()`/`close()`, keep existing `useModal`/`useTrapFocus` and CSS architecture
- **Option 3:** Keep `<div role="dialog">` and suppress Sonar

#### Decision Outcome

Chosen option: **Option 2 — Minimal native `<dialog>` migration**

**Justification:**

Option 1 (full migration) was ruled out because:

- Native `<dialog>::backdrop` has limited styling support — no `opacity` transition in all browsers, no `z-index` control — which would break the existing animated overlay in `Modal.scss`
- Native `<dialog>` Escape handling fires a `cancel` event and closes the dialog without running `closeModal()` (focus restore + `onClose` callback) — requiring an additional `onCancel` listener
- The existing `useModal`/`useTrapFocus` hooks are well-tested and correct; removing them is unnecessary scope

Option 2 preserves all existing behaviour while satisfying the Sonar rule:

- `<dialog>` element removes `role="dialog"`, `aria-modal`, and `aria-hidden` — all implicit on native `<dialog>`
- `showModal()`/`close()` is driven by a `useEffect` on `isOpen`, alongside the existing CSS class toggle for the animated open/close
- `useModal` and `useTrapFocus` remain unchanged — they receive `modalContainerRef.current` (the inner `<div>`) as before
- Browser default `<dialog>` styles (`border`, `max-width`, `max-height`, `color`) are explicitly reset in `Modal.scss`

##### Positive Consequences

- Removes `role="dialog"`, `aria-modal`, `aria-hidden` — native `<dialog>` provides these semantics implicitly via `showModal()`
- No changes to `useModal`, `useTrapFocus`, consumers, or CSS animation architecture
- Clears the Sonar flag

##### Negative Consequences

- Native `<dialog>` Escape key fires its own `close` event in addition to `useModal`'s Escape handler — both will call `onClose`. The `useModal` Escape handler runs first (via `keydown` on the inner div), so `onClose` is called once and `dialog.close()` is then a no-op. Requires regression testing to confirm no double-close.
- Browser support for `<dialog>` is 98%+ (Chrome 37+, Firefox 98+, Safari 15.4+) — acceptable for the SDK's target environments
