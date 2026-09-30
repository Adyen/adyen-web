# Styles

Design token generation and the shared mixin library. Four files, consumed by every `.scss` in the
SDK.

## Commands

| Task        | Command                                       |
| ----------- | --------------------------------------------- |
| Lint styles | `yarn workspace @adyen/adyen-web lint-styles` |
| Auto-fix    | `yarn workspace @adyen/adyen-web styles:fix`  |

## Boundaries

- **Owns**: `variable-generator.scss`, `mixins.scss`, `overrides.scss`, `index.scss`.
- **Never touches**: component styles.

## Design Tokens

Tokens are **generated from `@adyen/bento-design-tokens`**, which `variable-generator.scss` pulls
in (`aliases`, `definitions`, `components`). It's a devDependency — tokens are compiled into the
shipped CSS at build time, not resolved at runtime. The design system package is the source: a
locally invented token will not survive an upgrade and won't exist for merchants theming the SDK.

`variable-generator.scss` exposes the `token()` function the rest of the codebase consumes. Each
token resolves to a `var(--adyen-sdk-[token-name], <literal-default>)` reference at the usage
site — the SDK never declares those custom properties itself, the default lives in the `var()`
fallback. `--adyen-sdk-*` is the surface merchants override to theme the SDK.

The bare `token(...)` call form resolves only inside `variable-generator.scss` itself. Every other
file in the repo reaches it through a `@use` namespace.

## Mixins

`mixins.scss` is the shared library. Before adding one, check it isn't already covered:

| Group           | Examples                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Accessibility   | `b-focus-ring` (WCAG 2.1 AA focus indicator), `a11y-visually-hidden`                                |
| Typography      | `adyen-checkout-text-title`, `-body`, `-caption`, `-caption-stronger`, `-subtitle`                  |
| Responsive      | `media-{xs,s,l,xl}-and-up` / `-and-down`, plus `media-m-and-up` — there is no `media-m-and-down`    |
| Resets & layout | `b-link-reset`, `box-sizing-setter`, `adyen-checkout-input-wrapper-reset`, `fieldset-fields-layout` |
| Misc            | `set-spinner-color`, `adyen-checkout-icon-shadow`, `adyen-checkout-component-loading`               |

A mixin belongs here once 3+ components need it. A one-off stays with its component.

## Safety

- Never add a new design token — use an existing one from `@adyen/bento-design-tokens`. If nothing
  fits, raise it rather than inventing one locally.
- Never add a selector here that targets a single component.
