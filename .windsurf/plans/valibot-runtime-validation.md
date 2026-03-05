# Plan: Runtime Props Validation using Valibot

## Objective

Add runtime validation for props passed to `AdyenCheckout` (CoreConfiguration) and `UIElement` (UIElementProps) using [Valibot](https://valibot.dev). The validation should issue `console.warn` messages when merchants:

1. Pass **wrong values** for known props (e.g. `environment: 'staging'` instead of a valid environment string)
2. Pass **props that do not exist** on the configuration interface
3. Omit **required props** (e.g. missing `clientKey`)

Validation is advisory only (warnings, not errors) to avoid breaking existing integrations.

---

## Context

### Current State
- `assertConfigurationPropertiesAreValid` in `src/core/utils.ts` already checks for unknown props on `CoreConfiguration` using a manually maintained allowlist.
- There is no value-level validation (e.g. checking that `environment` is one of the allowed strings).
- `UIElement` has no equivalent prop validation at all.

### Key Files
- `src/core/types.ts` — `CoreConfiguration` interface (lines 110–354)
- `src/core/utils.ts` — existing `assertConfigurationPropertiesAreValid` (lines 22–79)
- `src/core/core.ts` — `Core` constructor calls `assertConfigurationPropertiesAreValid` (line 74)
- `src/core/core.defaultProps.ts` — default values
- `src/components/internal/UIElement/types.ts` — `UIElementProps` interface
- `src/components/internal/UIElement/UIElement.tsx` — `UIElement` constructor and `buildElementProps`
- `src/components/internal/BaseElement/types.ts` — `BaseElementProps` interface

---

## Steps

### 1. Install Valibot

```bash
# From the packages/lib directory
yarn add valibot
```

Verify it appears in `packages/lib/package.json` under `dependencies`.

### 2. Create the CoreConfiguration Valibot Schema

Create `src/core/validation/CoreConfigurationSchema.ts`:

- Define a Valibot `object` schema mirroring the `CoreConfiguration` interface
- For each prop, define the expected type and constraints:

```ts
import * as v from 'valibot';

// Example shape (adapt to actual CoreConfiguration interface)
const EnvironmentSchema = v.picklist(['test', 'live', 'live-us', 'live-au', 'live-apse', 'live-in']);

const PaymentAmountSchema = v.object({
    value: v.number(),
    currency: v.string()
});

const SessionSchema = v.object({
    id: v.string(),
    sessionData: v.optional(v.string()),
    shopperEmail: v.optional(v.string()),
    telephoneNumber: v.optional(v.string())
});

export const CoreConfigurationSchema = v.object({
    session: v.optional(SessionSchema),
    environment: v.optional(EnvironmentSchema),
    showPayButton: v.optional(v.boolean()),
    clientKey: v.optional(v.string()),
    locale: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    amount: v.optional(PaymentAmountSchema),
    secondaryAmount: v.optional(PaymentAmountSchema),
    exposeLibraryMetadata: v.optional(v.boolean()),
    // ... callbacks as v.optional(v.function())
    // ... remaining props
});
```

**Important considerations:**
- Callbacks (`onSubmit`, `onError`, etc.) should be validated as `v.optional(v.function())`
- Internal/private props (`_environmentUrls`, `loadingContext`) should be included but marked optional
- Use `v.picklist()` for enum-like string values (e.g. `environment`)
- Use `v.object()` for nested shapes (e.g. `amount`, `session`, `analytics`)

### 3. Create the UIElementProps Valibot Schema

Create `src/core/validation/UIElementPropsSchema.ts`:

- Define a schema for the merchant-facing props of `UIElementProps`
- Focus only on props that merchants configure (skip internal ones like `elementRef`, `modules`, `i18n`)
- Validate shared props: `showPayButton`, `amount`, `environment`, `type`, `name`, callbacks

### 4. Create the Validation Runner

Create `src/core/validation/validateProps.ts`:

```ts
import * as v from 'valibot';

/**
 * Validates props against a Valibot schema and logs warnings for any issues.
 * This is advisory-only — it never throws.
 */
export function validateProps<T>(
    schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>,
    props: Record<string, unknown>,
    componentName: string
): void {
    if (process.env.NODE_ENV !== 'development') return;

    const result = v.safeParse(schema, props);

    if (!result.success) {
        for (const issue of result.issues) {
            const path = issue.path?.map(p => p.key).join('.') || 'unknown';
            console.warn(
                `${componentName} - Invalid configuration: "${path}" ${issue.message}`
            );
        }
    }

    // Check for unknown props not in the schema
    // Valibot's strict object or pipe with custom check can handle this
}
```

**Key design decisions:**
- Gated behind `process.env.NODE_ENV === 'development'` so it is tree-shaken from production builds
- Uses `v.safeParse()` to avoid throwing — collects all issues
- Logs each issue individually with the prop path and a descriptive message

### 5. Integrate into Core Constructor

In `src/core/core.ts`, replace or augment `assertConfigurationPropertiesAreValid(props)`:

```ts
import { validateCoreConfiguration } from './validation/validateProps';

// In constructor:
validateCoreConfiguration(props); // replaces or supplements assertConfigurationPropertiesAreValid
```

**Decision point:** The existing `assertConfigurationPropertiesAreValid` does compile-time key checking via TypeScript generics. Valibot validation would replace the runtime `console.warn` loop (lines 72-78) but the compile-time validator helper could remain for DX. Discuss with the team whether to fully replace or layer on top.

### 6. Integrate into UIElement

In `src/components/internal/UIElement/UIElement.tsx`, add validation in the constructor or `buildElementProps`:

```ts
import { validateUIElementProps } from '../../core/validation/validateProps';

// In constructor or buildElementProps:
validateUIElementProps(componentProps);
```

### 7. Handle the Three Warning Cases

Ensure the schema + runner covers:

| Case | How Valibot Handles It |
|---|---|
| **Wrong values** | Type mismatches and `picklist` violations produce issues with descriptive messages |
| **Unknown props** | Use `v.strictObject()` instead of `v.object()` — it rejects unknown keys |
| **Missing required props** | Mark truly required fields without `v.optional()` — e.g. `clientKey: v.string()` |

### 8. Write Tests

Create `src/core/validation/__tests__/validateProps.test.ts`:

- Test that valid configs produce no warnings
- Test that wrong value types trigger a warning (e.g. `environment: 123`)
- Test that invalid enum values trigger a warning (e.g. `environment: 'staging'`)
- Test that unknown props trigger a warning (e.g. `{ foo: 'bar' }`)
- Test that missing required props trigger a warning
- Test that validation is skipped in production (`NODE_ENV !== 'development'`)
- Test that validation never throws (advisory only)

### 9. Measure Bundle Impact

- Run the existing bundle size check to measure the delta
- Verify that Valibot imports are tree-shaken in production builds (since validation is gated behind `NODE_ENV`)
- Compare the gzipped size contribution

### 10. Create an Index File

Create `src/core/validation/index.ts` to re-export the public API:

```ts
export { validateCoreConfiguration } from './validateProps';
export { validateUIElementProps } from './validateProps';
```

---

## File Structure

```
src/core/validation/
├── index.ts
├── CoreConfigurationSchema.ts
├── UIElementPropsSchema.ts
├── validateProps.ts
└── __tests__/
    └── validateProps.test.ts
```

---

## Success Criteria

- [ ] `console.warn` is emitted for wrong prop values in development
- [ ] `console.warn` is emitted for unknown props in development
- [ ] `console.warn` is emitted for missing required props in development
- [ ] No warnings emitted for valid configurations
- [ ] Validation is fully tree-shaken from production builds
- [ ] No breaking changes — validation is advisory only
- [ ] Bundle size impact is documented
- [ ] Unit tests cover all three warning cases
