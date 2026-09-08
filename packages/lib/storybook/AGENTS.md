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

`ComponentContainer` calls `addToWindow(element)` — which sets both `globalThis.component` and
`globalThis.parent.window['component']`, the second being what makes the instance reachable from
Playwright's top-level page while the story runs inside `iframe.html` — then awaits
`isAvailable()` before mounting, and unmounts on cleanup. It renders into a
`<div id="component-root">`, which is the selector `Base.a11yComponentSelector()` returns.

**`globalThis.component` is what the E2E suite drives.** Changing how or when
`ComponentContainer` sets it breaks every E2E spec at once, not just one component's.

## Conventions

- `types.ts` exports the story types every payment method uses: `MetaConfiguration<T>`,
  `StoryConfiguration<T>`, `PaymentMethodStoryProps<T>`.
- A story's ID is `{kebab-meta-title}--{kebab-export-name}` — the `Cards` meta title plus a
  `Default` export yields `components-cards--default`. `e2e-playwright/fixtures/URL_MAP.ts` is
  keyed on the full ID, so renaming either the export or the meta title breaks the matching E2E
  test.
- Opt a story out of automated visual regression with `tags: ['no-automated-visual-test']` (the tag
  is declared in `.storybook/main.ts`).
- Addons: `addon-a11y` and `addon-docs` via the `addons` array in `.storybook/main.ts`;
  `msw-storybook-addon` is wired separately as a loader in `.storybook/preview.tsx`.
- Log callbacks with `console.log`. `@storybook/addon-actions` is **not installed**, so importing
  it fails to resolve. Storybook 10 does ship an `action` helper in the core `storybook` package
  (`storybook/actions`) which _would_ resolve — we deliberately don't use it, to keep one logging
  convention across the repo rather than two.

## Safety

- Never change the `ComponentContainer` mount contract without running the full E2E suite in CI.
- Never import `@storybook/addon-actions` or `storybook/actions`.
