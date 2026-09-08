# Storybook

Story authoring infrastructure. Storybook is also the **target the Playwright E2E suite runs
against**, so story structure and naming are test infrastructure, not just documentation.

## Commands

| Task                     | Command                                             |
| ------------------------ | --------------------------------------------------- |
| Start (with mock server) | `yarn start:storybook` — serves on `localhost:3020` |
| Build static             | `yarn workspace @adyen/adyen-web build:storybook`   |
| Build for E2E (no MSW)   | `yarn build:storybook:e2e`                          |

The playground also defaults to port `3020`, so the two can't run at once.

## Boundaries

- **Owns**: `components/` (`Checkout`, `ComponentContainer`), `config/`, `helpers/`, `utils/`,
  `constants/`, `docs/`, `types.ts`, and the cross-cutting stories in `stories/`.
- **May read**: payment component classes, `core/` types.
- **Never touches**: component implementation code, E2E tests, production build config.

Where stories live: payment-method stories sit in the component's own folder (e.g.
`src/components/Card/stories/`). Only cross-cutting demos — session patching, redirect result,
review page — belong in `storybook/stories/`.

## Wrapper Pattern (Mandatory)

```tsx
import { Checkout } from '../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';

render: ({ componentConfiguration, ...checkoutConfig }) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new MyComponent(checkout, componentConfiguration)} />}
    </Checkout>
);
```

- `Checkout` initializes the SDK Core from the story args.
- `ComponentContainer` calls `addToWindow(element)` — which sets `globalThis.component` — then
  awaits `isAvailable()` before mounting, and unmounts on cleanup.

**E2E tests read `globalThis.component`.** Skip `ComponentContainer` and every E2E test for that
component breaks, so never mount a UIElement directly in a story.

### External pay button

```tsx
{
    checkout => {
        const instance = new MyComponent(checkout, componentConfiguration);
        return (
            <div>
                <ComponentContainer element={instance} />
                <button onClick={() => instance.submit()}>Pay</button>
            </div>
        );
    };
}
```

## Conventions

- Type stories with `MetaConfiguration<T>`, `StoryConfiguration<T>`, and
  `PaymentMethodStoryProps<T>` from `types.ts`.
- Export names generate story IDs: `export const CardSuccess` → `card-success`. E2E `URL_MAP.ts`
  entries are built from these, so renaming an export breaks the matching E2E test.
- Opt a story out of automated visual regression with `tags: ['no-automated-visual-test']` (the tag
  is declared in `.storybook/main.ts`).
- Log callbacks with `console.log`. `@storybook/addon-actions` is **not installed** — importing it
  breaks the build. Available addons: `addon-a11y`, `addon-docs`, `msw-storybook-addon`.

## Safety

- Never skip the `Checkout` + `ComponentContainer` wrapper.
- Never import `@storybook/addon-actions`.
- Always verify story IDs still match `fixtures/URL_MAP.ts` when renaming a story export.
