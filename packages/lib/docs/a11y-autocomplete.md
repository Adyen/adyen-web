# Autocomplete Tokens for Accessibility (WCAG 2.2)

This document provides guidance on using the `autocomplete` attribute for form fields
to ensure WCAG 2.2 compliance and proper browser autofill behavior.

## Quick Reference

| Field Type      | Autocomplete Token |
| --------------- | ------------------ |
| First name      | `given-name`       |
| Last name       | `family-name`      |
| Full name       | `name`             |
| Email           | `email`            |
| Phone           | `tel`              |
| Date of birth   | `bday`             |
| Street address  | `address-line1`    |
| Apt/Suite/Unit  | `address-line2`    |
| City            | `address-level2`   |
| State/Province  | `address-level1`   |
| Postal/ZIP code | `postal-code`      |
| Country         | `country-name`     |

## Address Prefixes

For billing/shipping distinction, prefix tokens with `billing` or `shipping`:

- `billing address-line1`
- `shipping postal-code`

The `Address` component derives the prefix automatically from its `label` prop:

- `label="billingAddress"` → `billing` prefix
- `label="deliveryAddress"` → `shipping` prefix

## When to Use `'off'` or `null`

- **`'off'`**: Security-sensitive fields (CVV, OTP codes) — explicitly prevents autofill
- **`null`**: Fields without a standard token (bank account numbers, sort codes) — omits attribute entirely

## Usage in Components

Pass the `autocomplete` prop to any `InputText`, `InputEmail`, or `InputTelephone` component:

```tsx
<InputText
    name="firstName"
    value={data.firstName}
    autocomplete="given-name"
    onInput={handleChangeFor('firstName', 'input')}
    onBlur={handleChangeFor('firstName', 'blur')}
/>
```

The `InputBase` component handles the `null` case by omitting the attribute entirely:

- `autocomplete="email"` → renders `autocomplete="email"`
- `autocomplete={null}` → attribute is omitted
- `autocomplete="off"` → renders `autocomplete="off"`

## WCAG Reference

Full list of input purposes: https://www.w3.org/TR/WCAG22/#input-purposes
