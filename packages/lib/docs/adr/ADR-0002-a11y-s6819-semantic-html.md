# A11Y S6819: Replace ARIA Role Overrides with Semantic HTML

## Context and Problem Statement

Sonar rule [S6819] flags components that apply ARIA `role` attributes to generic HTML elements (e.g. `<div role="dialog">`, `<div role="region">`) where a native semantic element exists. The rule states that native elements provide better screen reader compatibility than ARIA role overrides. Which of these flags are legitimate fixes, which are false positives, and what is the safest remediation for each?


## Decisions by Component

---

### 1. Issues with `role="img"` on SVG elements

Sonar issues: 
- `CVCHint.tsx` — `role="img"` on `<svg>` 
- `Toggle.tsx` — `role="img"` on checkmark `<svg>`
- `Timeline.tsx` — `role="img"` on decorative `<svg>`

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


### 2. `IssuerButtonGroup.tsx` — `<div role="group">`

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

### Select Component custom Aria Controls

Sonar Issues:

- `SelectList.tsx` — `role="listbox"` on `<ul>`
- `SelectListItem.tsx` — `role="option"` on `<li>`

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

### 3. `CardInput.tsx` — `<div role="form">`

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

For more details refer to COSDK-1077
