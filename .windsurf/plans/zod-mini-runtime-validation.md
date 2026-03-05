# Plan: Runtime Props Validation using Zod Mini

## Objective

Add runtime validation for props passed to `AdyenCheckout` (CoreConfiguration) and `UIElement` (UIElementProps) using [Zod Mini](https://zod.dev/mini) (`zod/mini`). The validation should issue `console.warn` messages when merchants:

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

### Why Zod Mini over regular Zod
- `zod/mini` is an entry point introduced in Zod v4 specifically for bundle-sensitive use cases
- It drops built-in error messages and some convenience methods
- Achieves ~2 KB gzipped vs ~13 KB for the full Zod package
- Same core API (`z.object`, `z.string`, `z.optional`, etc.) — just leaner

---

## Steps

### 1. Install Zod

```bash
# From the packages/lib directory
yarn add zod
```

Verify it appears in `packages/lib/package.json` under `dependencies`.
Note: `zod/mini` is an entry point of the `zod` package, not a separate package.

### 2. Create the CoreConfiguration Zod Mini Schema

Create `src/core/validation/CoreConfigurationSchema.ts`:

- Define a Zod Mini schema mirroring the `CoreConfiguration` interface
- For each prop, define the expected type and constraints:

```ts
import { z } from 'zod/mini';

const EnvironmentSchema = z.enum(['test', 'live', 'live-us', 'live-au', 'live-apse', 'live-in']);

const PaymentAmountSchema = z.object({
    value: z.number(),
    currency: z.string()
});

const SessionSchema = z.object({
    id: z.string(),
    sessionData: z.optional(z.string()),
    shopperEmail: z.optional(z.string()),
    telephoneNumber: z.optional(z.string())
});

export const CoreConfigurationSchema = z.object({
    session: z.optional(SessionSchema),
    environment: z.optional(EnvironmentSchema),
    showPayButton: z.optional(z.boolean()),
    clientKey: z.optional(z.string()),
    locale: z.optional(z.string()),
    countryCode: z.optional(z.string()),
    amount: z.optional(PaymentAmountSchema),
    secondaryAmount: z.optional(PaymentAmountSchema),
    exposeLibraryMetadata: z.optional(z.boolean()),
    // ... callbacks as z.optional(z.function())
    // ... remaining props
}).strict(); // .strict() rejects unknown keys
```

**Important considerations:**
- Callbacks (`onSubmit`, `onError`, etc.) should be validated as `z.optional(z.function())`
- Internal/private props (`_environmentUrls`, `loadingContext`) should be included but marked optional
- Use `z.enum()` for enum-like string values (e.g. `environment`)
- Use `z.object()` for nested shapes (e.g. `amount`, `session`, `analytics`)
- Use `.strict()` on the top-level object to catch unknown props

**Zod Mini difference:** Since `zod/mini` omits built-in error messages, custom error messages must be provided explicitly via `z.string({ error: "..." })` or a custom error map. This is extra work but gives full control over warning text.

### 3. Create the UIElementProps Zod Mini Schema

Create `src/core/validation/UIElementPropsSchema.ts`:

- Define a schema for the merchant-facing props of `UIElementProps`
- Focus only on props that merchants configure (skip internal ones like `elementRef`, `modules`, `i18n`)
- Validate shared props: `showPayButton`, `amount`, `environment`, `type`, `name`, callbacks

### 4. Create the Validation Runner

Create `src/core/validation/validateProps.ts`:

```ts
import type { z } from 'zod/mini';

/**
 * Validates props against a Zod Mini schema and logs warnings for any issues.
 * This is advisory-only — it never throws.
 */
export function validateProps<T extends z.ZodType>(
    schema: T,
    props: Record<string, unknown>,
    componentName: string
): void {
    if (process.env.NODE_ENV !== 'development') return;

    const result = schema.safeParse(props);

    if (!result.success) {
        for (const issue of result.error.issues) {
            const path = issue.path.join('.') || 'unknown';
            console.warn(
                `${componentName} - Invalid configuration: "${path}" ${issue.message}`
            );
        }
    }
}
```

**Key design decisions:**
- Gated behind `process.env.NODE_ENV === 'development'` so it is tree-shaken from production builds
- Uses `schema.safeParse()` to avoid throwing — returns a result with success/error
- Logs each issue individually with the prop path and a descriptive message
- Zod Mini note: since built-in messages are omitted, the `issue.message` may be empty unless custom error messages are provided in the schema. Consider providing a custom error map or adding messages per-field.

### 5. Custom Error Map for Zod Mini

Since `zod/mini` strips default error messages, create a custom error map:

```ts
import { z } from 'zod/mini';

z.config({
    customError: (issue) => {
        if (issue.code === 'invalid_type') {
            return `expected ${issue.expected}, received ${issue.received}`;
        }
        if (issue.code === 'unrecognized_keys') {
            return `unknown property "${issue.keys.join('", "')}"`;
        }
        if (issue.code === 'invalid_enum_value') {
            return `must be one of: ${issue.options.join(', ')}`;
        }
        return 'invalid value';
    }
});
```

This must be called once at initialization time, before any validation runs.

### 6. Integrate into Core Constructor

In `src/core/core.ts`, replace or augment `assertConfigurationPropertiesAreValid(props)`:

```ts
import { validateCoreConfiguration } from './validation/validateProps';

// In constructor:
validateCoreConfiguration(props); // replaces or supplements assertConfigurationPropertiesAreValid
```

**Decision point:** The existing `assertConfigurationPropertiesAreValid` does compile-time key checking via TypeScript generics. Zod validation would replace the runtime `console.warn` loop (lines 72-78) but the compile-time validator helper could remain for DX. Discuss with the team whether to fully replace or layer on top.

### 7. Integrate into UIElement

In `src/components/internal/UIElement/UIElement.tsx`, add validation in the constructor or `buildElementProps`:

```ts
import { validateUIElementProps } from '../../core/validation/validateProps';

// In constructor or buildElementProps:
validateUIElementProps(componentProps);
```

### 8. Handle the Three Warning Cases

Ensure the schema + runner covers:

| Case | How Zod Mini Handles It |
|---|---|
| **Wrong values** | Type mismatches and `enum` violations produce issues (custom messages via error map) |
| **Unknown props** | `.strict()` on the object schema rejects unrecognized keys |
| **Missing required props** | Fields without `z.optional()` wrapper are required by default |

### 9. Write Tests

Create `src/core/validation/__tests__/validateProps.test.ts`:

- Test that valid configs produce no warnings
- Test that wrong value types trigger a warning (e.g. `environment: 123`)
- Test that invalid enum values trigger a warning (e.g. `environment: 'staging'`)
- Test that unknown props trigger a warning (e.g. `{ foo: 'bar' }`)
- Test that missing required props trigger a warning
- Test that validation is skipped in production (`NODE_ENV !== 'development'`)
- Test that validation never throws (advisory only)
- Test that custom error messages are descriptive (Zod Mini-specific)

### 10. Measure Bundle Impact

- Run the existing bundle size check to measure the delta
- Verify that `zod/mini` imports are tree-shaken in production builds (since validation is gated behind `NODE_ENV`)
- Compare the gzipped size contribution
- Verify that `zod/mini` is used and not the full `zod` entry point (check import paths)

### 11. Create an Index File

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
├── errorMap.ts              # Custom error map for zod/mini
└── __tests__/
    └── validateProps.test.ts
```

---

## Zod Mini vs Full Zod — Key Differences to Watch

| Feature | Full Zod | Zod Mini |
|---|---|---|
| Built-in error messages | Yes | No — must provide custom error map |
| `.describe()` | Yes | No |
| `.brand()` | Yes | No |
| Bundle size (min+gz) | ~13 KB | ~2 KB |
| Import path | `from 'zod'` | `from 'zod/mini'` |

Ensure all imports use `from 'zod/mini'` and never `from 'zod'` to avoid pulling in the full package.

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
- [ ] All imports use `zod/mini`, never `zod` directly
- [ ] Custom error map provides descriptive warning messages
