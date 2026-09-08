# Styles

Design token system, shared mixins, and CSS custom property definitions. The foundation for both
legacy global BEM styles and new CSS Modules.

## Commands

| Task        | Command                               |
| ----------- | ------------------------------------- |
| Lint styles | `yarn --cwd packages/lib lint-styles` |
| Auto-fix    | `yarn --cwd packages/lib styles:fix`  |

## Boundaries

- **Owns**: `variable-generator.scss`, `mixins.scss`, `overrides.scss`, `index.scss`.
- **Never touches**: component styles — those live next to their component.

## Design Tokens

Tokens are **generated from `@adyen/bento-design-tokens`**, which `variable-generator.scss` pulls
in (`aliases`, `definitions`, `components`). That's why you don't hand-write tokens here: the
design system package is the source, and a locally invented token will not survive an upgrade and
won't exist for consumers theming the SDK.

Consume them through the `token()` function, and emit CSS custom properties named
`--adyen-sdk-[token-name]` for merchant overrides.

## Writing Styles

Use `@use` with a namespace. `@import` is deprecated in Sass and is not used anywhere in this
codebase — don't reintroduce it.

```scss
@use 'styles/mixins';
@use 'styles/variable-generator';

.bankList {
    padding-top: variable-generator.token(spacer-070);
    color: variable-generator.token(color-label-primary);

    @include mixins.adyen-checkout-text-caption;
}
```

Note the namespace: it's `variable-generator.token(...)`, not a bare `token(...)`. The bare form
only works inside `variable-generator.scss` itself.

- **New components**: CSS Modules — `ComponentName.module.scss`, camelCase class names
  (`.bankList`, `.errorMessage`), imported as `import styles from './ComponentName.module.scss'`.
- **Legacy components**: global SCSS with BEM —
  `.adyen-checkout__[component]__[element]--[modifier]`.

## Mixins

`mixins.scss` covers more than you might expect — check it before writing anything by hand:

| Group           | Examples                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Accessibility   | `b-focus-ring` (WCAG 2.1 AA focus indicator), `a11y-visually-hidden`                                |
| Typography      | `adyen-checkout-text-title`, `-body`, `-caption`, `-caption-stronger`, `-subtitle`                  |
| Responsive      | `media-xs-and-up` / `-and-down` through `media-xl-and-up` / `-and-down`                             |
| Resets & layout | `b-link-reset`, `box-sizing-setter`, `adyen-checkout-input-wrapper-reset`, `fieldset-fields-layout` |
| Misc            | `set-spinner-color`, `adyen-checkout-icon-shadow`, `adyen-checkout-component-loading`               |

## Safety

- Never add a new design token — use an existing one from `@adyen/bento-design-tokens`. If nothing
  fits, raise it rather than inventing one locally.
- Never hardcode a colour, spacing, or radius value where a token exists.
- Never use inline styles or CSS-in-JS.
- Never mix CSS Modules and global SCSS in the same component.
- Always support RTL with `[dir='rtl'] &` selectors.
- Never add `stylelint-disable` in new styles — fix the violation, or ask.
