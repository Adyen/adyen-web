# E2E Playwright Tests

End-to-end tests for Adyen Web SDK using Playwright.

## Running Tests

```bash
# From repository root
cd packages/e2e-playwright

# Run all tests headless
yarn test:headless

# Run tests with browser UI
yarn test:headed

# Run tests with Playwright UI (interactive mode)
yarn test:ui
```

## Dist Suite

`yarn test:e2e:dist` runs the same specs, Page Object Models and story URLs as the default suite,
but against a Storybook build that renders the **built library** (`dist/es`) instead of
Vite-compiled source. Stories import `@adyen/adyen-web`, so the run exercises the bundle merchants install and catches build-only regressions.

```bash
# From repository root
yarn test:e2e:dist tests/e2e/card/card.spec.ts --project=chromium   # one component, like the default suite
SKIP_LIB_BUILD=1 yarn test:e2e:dist ...                            # library already built, only test code changed
```

The `webServer` in `dist.playwright.config.ts` builds the library, then the dist Storybook build
(`build:storybook:e2e:dist`, selected by `STORYBOOK_TARGET=dist`), then serves it on port 3020.
Only one Storybook target can run at a time. A cold run is slow because of the library build.

CI runs this suite on every PR and in the merge queue using Chromium and the latest API version.
It is advisory on PRs and blocking in the merge queue.

## Directory Structure

```
e2e-playwright/
├── fixtures/           # Test fixtures extending Playwright's base test
│   ├── base-fixture.ts # Base fixture with translation routing
│   ├── URL_MAP.ts      # Storybook URL mappings for test pages
│   └── *.fixture.ts    # Component-specific fixtures (card, dropin, etc.)
├── mocks/              # API response mocks
├── models/             # Page Object Models for components
│   ├── card.ts         # Card component interactions
│   ├── dropin.ts       # Drop-in component interactions
│   └── ...
├── tests/
│   ├── a11y/           # Accessibility tests (separate pipeline)
│   ├── automated/      # Automated visual tests (separate pipeline)
│   ├── e2e/            # End-to-end flow tests
│   │   ├── card/
│   │   ├── dropin/
│   │   ├── issuerList/
│   │   └── ...
│   ├── ui/             # UI interaction tests
│   └── utils/          # Test utilities and constants
│       ├── assertions.ts  # Custom assertions (toHaveScreenshot)
│       └── constants.ts   # Test constants and tags
├── playwright.config.ts           # Main E2E config
├── dist.playwright.config.ts      # Same suite against the built library (dist/es)
├── automated-visual.playwright.config.ts  # Automated visual tests config
└── automated-ally.playwright.config.ts    # Accessibility tests config
```

---

## Screenshot Tests

### How Screenshot Tests Work

Screenshot tests use the `@screenshot` tag and a custom `toHaveScreenshot` function that handles cross-platform/browser differences.

### Running Screenshot Tests Locally

```bash
# Update screenshots (Linux + Chromium only)
yarn test:update-screenshots

# Update with UI mode
yarn test:update-screenshots:ui
```

### Platform & Browser Behavior

The custom `toHaveScreenshot` function in `tests/utils/assertions.ts` controls when screenshots are captured:

| Environment               | Chromium   | Firefox    | WebKit     |
| ------------------------- | ---------- | ---------- | ---------- |
| **CI (Linux)**            | ✅ Runs    | ✅ Runs    | ✅ Runs    |
| **Local (Linux)**         | ✅ Runs    | ⏭️ Skipped | ⏭️ Skipped |
| **Local (macOS/Windows)** | ⏭️ Skipped | ⏭️ Skipped | ⏭️ Skipped |

This ensures screenshots are consistent (always generated on Linux) while allowing local development on any OS.

### Using the Custom toHaveScreenshot

**Always use the custom function** instead of Playwright's built-in assertion:

```typescript
// ✅ Correct - use custom function
import { toHaveScreenshot } from '../../utils/assertions';

test('my test', { tag: [TAGS.SCREENSHOT] }, async ({ myComponent, browserName }) => {
    await toHaveScreenshot(myComponent.rootElement, browserName, 'my-screenshot.png');
});

// ❌ Wrong - don't use Playwright's assertion directly
await expect(locator).toHaveScreenshot('my-screenshot.png');
```

**Key points:**

- Import `toHaveScreenshot` from `tests/utils/assertions.ts`
- Pass `browserName` from the test context
- Tag tests with `{ tag: [TAGS.SCREENSHOT] }` for filtering

---

## Updating Screenshots on CI

### Step 1: Trigger Screenshot Update

Add the `screenshot` label to your PR on GitHub. This triggers the `update-screenshots.yml` workflow which:

1. Runs screenshot tests with `--update-snapshots`
2. Commits updated screenshots automatically
3. Removes the `screenshot` label when complete

### Step 2: Re-run CI Checks

After screenshots are updated, the commit has `[skip ci]` to avoid infinite loops. To trigger CI checks:

```bash
git pull                                    # Get the screenshot updates
git commit --allow-empty -m "Trigger CI"    # Create empty commit
git push                                    # Push to trigger CI
```

---

## Configuration Files

| File                                    | Purpose                                       |
| --------------------------------------- | --------------------------------------------- |
| `playwright.config.ts`                  | Main E2E tests (excludes `automated/` folder) |
| `dist.playwright.config.ts`             | Same suite against the built library (dist)   |
| `automated-visual.playwright.config.ts` | Automated visual regression tests             |
| `automated-ally.playwright.config.ts`   | Automated accessibility tests                 |
