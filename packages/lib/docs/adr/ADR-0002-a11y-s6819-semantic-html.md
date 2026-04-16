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

Chosen option: **Keep `role="img"`, suppress Sonar**

**Justification:** Both SVGs are informative inline SVGs that carry meaning — they depict the front and back of a card with the CVC location highlighted, and their `<title>` element is populated with a localised `fieldLabel` string. Per [MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_in_HTML#best_practices) and the [EU Data Visualisation Guide](https://data.europa.eu/apps/data-visualisation-guide/accessible-svg-and-aria), the recommended pattern for informative inline SVGs is `role="img"` + `<title>` + `aria-labelledby`. Without `role="img"`, the EU guide explicitly warns: *"some screen readers will not correctly treat it as an image, and might not read out the content of the `<title>` and `<desc>` elements. So it is safer to set the `role` attribute to `img`"* ([source](https://data.europa.eu/apps/data-visualisation-guide/making-svg-content-fully-accessible)).

The `aria-hidden` toggling is complementary, not contradictory — it hides the *inactive* SVG from AT while the *active* one (with `role="img"`) is correctly announced. Removing `role="img"` risks the active SVG's `<title>` not being read by some screen readers.

This is a **Sonar false positive** for this specific case — `role="img"` on an informative inline SVG is the spec-recommended pattern.

##### Positive Consequences

- Active SVG correctly announced as an image with its `<title>` text by all screen readers
- Follows MDN and ARIA spec recommendations for informative inline SVGs

##### Negative Consequences

- Sonar flag remains — must be suppressed via SonarCloud UI

---

### 2. `Timeline.tsx` — `role="img"` on decorative `<svg>`

#### Decision Outcome

Chosen option: **Keep `role="img"`, suppress Sonar**

**Justification:** `aria-hidden` is the single source of truth for AT visibility — it already controls whether any SVG (and its `role`) is exposed to the accessibility tree. Removing `role="img"` to satisfy Sonar would create a coupling where SVG semantics depend on knowledge of the surrounding `aria-hidden` context. If `aria-hidden` were ever removed or restructured, the SVG would be exposed to AT without a role. Keeping `role="img"` on all SVGs is the safer, more resilient pattern — `aria-hidden` suppresses it when decorative, and `role="img"` ensures correct AT announcement when visible.

This is a **Sonar false positive** — the rule does not account for `aria-hidden` context.

##### Positive Consequences

- SVG semantics are self-contained and independent of surrounding `aria-hidden` context
- Consistent pattern across all SVGs in the codebase

##### Negative Consequences

- Sonar flag remains — must be suppressed via SonarCloud UI

---

### 3. `Toggle.tsx` — `role="img"` on checkmark `<svg>`

#### Decision Outcome

Chosen option: **Keep `role="img"`, suppress Sonar**

**Justification:** Same reasoning as `Timeline.tsx` — `aria-hidden` on the parent `<span>` is the AT visibility control. `role="img"` on the SVG is kept for the same resilience reason: if `aria-hidden` changes, the SVG still has correct semantics. Sonar does not consider the `aria-hidden` ancestor context when flagging this.

##### Positive Consequences

- Consistent with the unified SVG pattern across the codebase
- Self-contained SVG semantics independent of surrounding structure

##### Negative Consequences

- Sonar flag remains — must be suppressed via SonarCloud UI

---

### 4. `SegmentedControlRegion.tsx` — `<div role="region">`

#### Context and Problem Statement

The component wraps a content panel associated with a `SegmentedControl` tab. It uses `<div role="region" aria-labelledby>` to expose it as a landmark region.

#### Considered Options

- **Option 1:** Replace with `<section aria-labelledby>`
- **Option 2:** Keep `<div role="region">` and suppress Sonar

#### Decision Outcome

Chosen option: **`<section aria-labelledby>`**

**Justification:** `<section>` is the native HTML equivalent of `role="region"`. When paired with `aria-labelledby`, it is exposed as a landmark region identically to `<div role="region">`. `<section>` is a block-level element with no default styling differences from `<div>`, so no CSS changes are needed. Per [MDN — ARIA: region role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/region_role): *"If the content warrants a navigation landmark, use the `nav` element; otherwise use `section`"* — and the landmark is only exposed when the element has an accessible name, which `aria-labelledby` provides.

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

- **Option 1:** Replace with `<form name="cardPayment" onSubmit={e => e.preventDefault()}>`
- **Option 2:** Keep `<div role="form">` and suppress Sonar

#### Decision Outcome

Chosen option: **Keep `<div role="form">`, suppress Sonar**

**Justification:** The SDK is an embeddable library injected into merchant pages. Introducing a native `<form>` element into the merchant's DOM carries risks that outweigh the benefit:

- A merchant's page may already have a `<form>` wrapping the checkout area. Nesting `<form>` elements is invalid HTML — browsers will silently split or discard the inner form.
- Native `<form>` participates in the browser's built-in form submission machinery (Enter key on inputs, `requestSubmit()`, autofill heuristics). Even with `onSubmit={e => e.preventDefault()}`, some browser behaviours (e.g. implicit submission via Enter in a single-input form) are difficult to fully neutralise across all environments.
- The SDK payment flow is driven entirely by `UIElement.submit()` — there is no intended native form submission path. `role="form"` correctly exposes the landmark to AT without any of the native `<form>` side effects.

This is a **justified Sonar suppression** — `role="form"` on a `<div>` is intentional library design, not an oversight.

##### Positive Consequences

- No risk of nested-form invalid HTML in merchant pages
- No unintended native form submission behaviour
- AT still receives the form landmark via `role="form"`

##### Negative Consequences

- Sonar flag remains open — must be suppressed via SonarCloud UI or `sonar.issue.ignore.multicriteria`

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
