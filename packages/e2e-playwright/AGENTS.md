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

| Directory                  | Purpose                                                                      |
| -------------------------- | ---------------------------------------------------------------------------- |
| `models/`                  | Page Object Models, one per component, extending `Base`                      |
| `fixtures/`                | Custom fixtures plus `URL_MAP.ts` (Storybook story URLs)                     |
| `tests/e2e/`               | Specs grouped by component                                                   |
| `tests/a11y/`              | axe-core accessibility specs                                                 |
| `tests/ui/`                | UI interaction specs                                                         |
| `tests/visual-regression/` | Screenshot comparison specs                                                  |
| `tests/automated/`         | Generated a11y and visual suites (separate configs)                          |
| `tests/utils/`             | `constants.ts`, `cards.ts`, `assertions.ts`, `getStoryUrl.ts`, `keyboard.ts` |
| `mocks/`                   | Mock API responses                                                           |

## Page Object Model

Extend `Base` (which supplies `goto`, `pay`, `isPayable`, `isComponentVisible`, `getA11yErrors`
and the `payButton` locator), declare locators as `readonly`, and override
`isComponentVisible()`.

```ts
class MyComponent extends Base {
    readonly someField: Locator;
    readonly errorFields: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.someField = this.page.getByRole('textbox', { name: /field name/i });
        this.errorFields = this.page.locator('.adyen-checkout__field--error');
    }

    async isComponentVisible() {
        await this.page.locator('.adyen-checkout__[component]').first().waitFor({ state: 'visible' });
    }
}
```

### Composition

When a component builds on another, compose or extend the existing model instead of duplicating
locators. `models/card-avs.ts` is the reference — it extends `Card` and holds an `Address`
instance:

```ts
class CardWithAvs extends Card {
    readonly billingAddress: Address;

    constructor(page: Page) {
        super(page);
        this.billingAddress = new Address(page);
    }
}
```

### Fixtures

```ts
import { test as base, expect } from '../../../fixtures/base-fixture';

type Fixture = { myPage: MyComponent };
const test = base.extend<Fixture>({
    myPage: async ({ page }, use) => {
        await use(new MyComponent(page));
    }
});
```

### URL_MAP

Story URLs live in `fixtures/URL_MAP.ts`, following
`/iframe.html?args=&globals=&id=[storybook-id]&viewMode=story`. Storybook derives the ID from the
story's export name (`CardSuccess` → `card-success`), so a renamed export breaks the mapping.

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

`getByTestId` is deliberately absent. If steps 1–4 can't reach an element, the component has an
accessibility gap — report it rather than working around it.

## Assertions

Screenshots go through the custom helper, not Playwright's built-in, and the test must carry the
screenshot tag so it can be filtered:

```ts
import { toHaveScreenshot } from '../../utils/assertions';

test('my test', { tag: [TAGS.SCREENSHOT] }, async ({ myComponent, browserName }) => {
    await toHaveScreenshot(myComponent.rootElement, browserName, 'my-screenshot.png');
});
```

For validation errors assert on `.adyen-checkout__field--error` on the field container.
`.adyen-checkout__error-text` does **not** exist in this codebase.

## Safety

- Never use `page.waitForTimeout` — use `waitFor` conditions.
- Never hardcode test data — use `tests/utils/constants.ts` and `tests/utils/cards.ts`.
- Never duplicate locators or methods from an existing model — compose instead.
- Prefer real test-environment API responses; mock `/paymentMethods` only for an edge case the API
  can't produce.
- Always scope locators to the component root where possible.
