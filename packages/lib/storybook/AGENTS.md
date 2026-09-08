# Storybook

Story authoring infrastructure: the `Checkout` and `ComponentContainer` wrappers, story types, and
the config that builds it all. Storybook is also the **target the Playwright E2E suite runs
against**, so this is test infrastructure, not just documentation.

Most stories are not written here — payment-method stories live in the component's own folder
(`src/components/Card/stories/`). Only cross-cutting demos — session patching, redirect result,
review page — belong in `storybook/stories/`.

## Commands

| Task                     | Command                                           |
| ------------------------ | ------------------------------------------------- |
| Start (with mock server) | `yarn start:storybook` from the repo root         |
| Build static             | `yarn workspace @adyen/adyen-web build:storybook` |
| Build for E2E (no MSW)   | `yarn build:storybook:e2e` from the repo root     |

## Boundaries

- **Owns**: `components/` (`Checkout`, `ComponentContainer`), `config/`, `helpers/`, `utils/`,
  `constants/`, `docs/`, `types.ts`, and the cross-cutting stories in `stories/`.
- **May read**: payment component classes, `core/` types.
- **Never touches**: component implementation code, E2E tests, production build config.

## The wrapper contract

`Checkout` initializes the SDK Core from the story args and hands it to a render prop.

`ComponentContainer` calls `addToWindow(element)` — which sets `globalThis.component` — then
awaits `isAvailable()` before mounting, and unmounts on cleanup.

**`globalThis.component` is what the E2E suite drives.** Changing how or when
`ComponentContainer` sets it breaks every E2E spec at once, not just one component's.

## Conventions

- `types.ts` exports the story types every payment method uses: `MetaConfiguration<T>`,
  `StoryConfiguration<T>`, `PaymentMethodStoryProps<T>`.
- Storybook derives a story's ID from its export name (`CardSuccess` → `card-success`), and
  `e2e-playwright/fixtures/URL_MAP.ts` is keyed on those IDs. Renaming an export breaks the
  matching E2E test.
- Opt a story out of automated visual regression with `tags: ['no-automated-visual-test']` (the tag
  is declared in `.storybook/main.ts`).
- Available addons: `addon-a11y`, `addon-docs`, `msw-storybook-addon`. `@storybook/addon-actions`
  is **not installed** and importing it breaks the build — log callbacks with `console.log`.

## Safety

- Never change the `ComponentContainer` mount contract without running the full E2E suite in CI.
- Never import `@storybook/addon-actions`.
