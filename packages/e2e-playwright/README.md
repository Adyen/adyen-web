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
| `automated-visual.playwright.config.ts` | Automated visual regression tests             |
| `automated-ally.playwright.config.ts`   | Automated accessibility tests                 |
