# E2E Testing (Playwright)

End-to-end tests running against Storybook, using the Page Object Model, custom fixtures,
axe-core for accessibility, and cross-browser execution.

## Commands

Run from the repo root.

| Task                                | Command                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| One spec, chromium (default choice) | `yarn test:e2e tests/e2e/[component]/[component].spec.ts --project=chromium` |
| Filter by test name                 | `yarn test:e2e --project=chromium -g "test name"`                            |
| Interactive UI mode                 | `yarn test:ui`                                                               |
| One spec, all browsers              | `yarn test:e2e tests/e2e/[component]/[component].spec.ts`                    |
| Update screenshots                  | `yarn test:e2e:update-screenshots`                                           |

**Scope every run to the spec for the component you changed, on chromium.** A full-suite or
all-browser run takes a long time and is flaky outside CI — let CI own the full matrix.

The automated a11y and visual suites (`yarn test:automated-a11y`, `yarn test:automated-visual`)
are CI jobs with their own configs (`automated-ally.playwright.config.ts`,
`automated-visual.playwright.config.ts`) and test directories under `tests/automated/`.
`--project=chromium` does not apply to them, and the visual suite compares platform-matched
screenshots you won't have locally, so running it produces noise rather than signal.

Playwright's `webServer` builds and serves Storybook automatically, so don't start it by hand.
The first run is slow because it runs a full Storybook build.

## Boundaries

- **Owns**: `models/`, `fixtures/`, `tests/`, `mocks/`, and the config files.
- **May read**: Storybook stories via iframe URLs, and rendered component DOM.
- **Never touches**: component source, Storybook config, library source. If a test is hard to
  write because the markup is inaccessible, **report it** — do not patch the library from here.

| Directory          | Purpose                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `models/`          | Page Object Models — one per payment method, extending `Base`                            |
| `fixtures/`        | Custom fixtures plus `URL_MAP.ts` (Storybook story URLs)                                 |
| `tests/e2e/`       | Specs grouped by component                                                               |
| `tests/a11y/`      | axe-core accessibility specs                                                             |
| `tests/ui/`        | UI interaction specs                                                                     |
| `tests/automated/` | Generated a11y and visual suites (separate configs)                                      |
| `tests/utils/`     | `constants.ts`, `cards.ts`, `assertions.ts`, `getStoryUrl.ts`, `keyboard.ts`, `image.ts` |
| `mocks/`           | Mock API responses                                                                       |

There is no separate screenshot directory — screenshot specs live inside `tests/e2e/`,
`tests/a11y/` and `tests/ui/`, tagged `@screenshot`, with snapshots under
`__screenshots__/{platform}/{project}/`.

## Page Object Model

Extend `Base` (which supplies `goto`, `pay`, `isPayable`, `isComponentVisible`, `getA11yErrors`,
`a11yComponentSelector()` and the `payButton` locator — `payButton` is declared there but assigned
by the subclass). Take `page` as a `public readonly` constructor parameter, declare every locator
`readonly` and assign it in the constructor, and override `isComponentVisible()` to wait for the
component root to become visible.

A full payment-method model extends `Base`. Composable fragments that render inside another
component don't — `Address`, `PersonalDetails`, `SRPanel` and `ThreeDs2Challenge` are plain classes
meant to be held as a field. `rootElement` is declared per-model, not on `Base`.

Start from the closest existing model rather than from scratch:

| Need                             | Read                                                      |
| -------------------------------- | --------------------------------------------------------- |
| Minimal payment-method model     | `models/upi.ts`                                           |
| Large model, many locators       | `models/card.ts`                                          |
| Composing one model into another | `models/card-avs.ts` — extends `Card`, holds an `Address` |
| Fragment model (no `Base`)       | `models/address.ts`                                       |
| Registering a model as a fixture | `fixtures/card.fixture.ts`                                |

### Composition

When a component builds on another, extend or compose the existing model instead of duplicating
its locators — hold the other model as a `readonly` field and construct it with the same `page`.

### Fixtures

One `fixtures/[component].fixture.ts` per component, declaring a `Fixture` type and passing it to
`base.extend<Fixture>()`. Extend `./base-fixture` rather than `@playwright/test` directly — it's
an intentionally empty `base.extend({})` that exists as the single seam for cross-cutting test
setup, so every spec inherits future changes for free. Related variants share one fixture file
(`card.fixture.ts` registers `card`, `cardWithAvs`, `cardWithKCP`, `bcmc` and more); re-export
`test` and `expect` from it and import both from the spec.

### URL_MAP

Story URLs live in `fixtures/URL_MAP.ts`, following
`/iframe.html?args=&globals=&id=[storybook-id]&viewMode=story`. The Storybook ID is
`{kebab-meta-title}--{kebab-export-name}`, not the export name alone — the real entries look like
`components-cards--default`, `components-cards--with-avs` and `drop-in-drop-in-component--default`.
Renaming either the export or the meta title breaks the mapping.

For per-test component config, use `getStoryUrl({ baseUrl: URL_MAP.card, componentConfig })`
rather than adding a near-duplicate story.

## Locator Priority (accessibility-first)

1. `getByRole('textbox', { name: /field name/i })` — always prefer, case-insensitive regex
2. `getByLabel` — form inputs with labels
3. `getByText` — static content
4. Keyboard/tab order (`page.keyboard.press('Tab')`) — to assert focus sequence and reach elements
   the way a shopper does
5. `locator('.adyen-checkout__[component]')` — component containers only, never interactive
   elements

Don't reach for `getByTestId` in new tests. If steps 1–4 can't reach an element, the component has
an accessibility gap — report it rather than working around it. About a dozen existing usages
remain (`models/iris.ts`, `models/card-fastlane.ts`, the Drop-in review-page and giftcard specs);
some target the Storybook harness, which is defensible, but several target library markup and are
exactly the workaround this rule exists to prevent. Don't cite them as precedent.

## Assertions

Screenshots go through the custom `toHaveScreenshot` in `tests/utils/assertions.ts`, never
Playwright's built-in `expect(locator).toHaveScreenshot()` — the custom one skips on platforms
without matching snapshots and waits for images to load. Pass `browserName` from the test context,
and tag the test `{ tag: [TAGS.SCREENSHOT] }` (`TAGS` comes from `tests/utils/constants.ts`) so it
can be filtered. `README.md` has a worked before/after example.

For validation errors assert on `.adyen-checkout__field--error` on the field container — that
class marks the field as errored. The error **text** carries
`.adyen-checkout-contextual-text--error`, which is what `models/card.ts` and `models/address.ts`
already use. `.adyen-checkout__error-text` is dead: it survives only inside a stale prebuilt
bundle at `packages/playground/src/pages/DropinUMD/adyen.css` and exists nowhere in the library
source, so never assert on it.

## Safety

- Don't add `page.waitForTimeout` — use `waitFor` conditions. Around 40 calls survive in the suite
  (including `models/automated.ts`), nothing lints against them, and they're a leading cause of
  flake. Removing one you happen to be near is welcome; adding one needs a reason.
- Never hardcode test data — use `tests/utils/constants.ts` and `tests/utils/cards.ts`.
- Never duplicate locators or methods from an existing model — compose instead.
- Prefer real test-environment API responses; mock `/paymentMethods` only for an edge case the API
  can't produce.
- Always scope locators to the component root where possible.
