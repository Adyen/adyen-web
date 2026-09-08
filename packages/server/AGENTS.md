# Server

Mock backend for the playground and Storybook: proxies the Adyen Checkout API and serves the
translation files. Also holds the canonical translation source for the SDK.

## Commands

| Task                | Command                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| Start               | `yarn workspace @adyen/adyen-web-server start` (or automatically via `yarn start`) |
| Start for Storybook | `yarn start:prod-storybook` from the repo root                                     |
| Validate locales    | `yarn validate:locales` from the repo root                                         |

`validate:locales` lives at the repo root (`scripts/validate-locales.js`), not in this package.

## Boundaries

- **Owns**: `translations/` (32 locale files), `api/` (proxy routes), `utils/`, `index.js`,
  `start.js`.
- **Never touches**: library source or component implementations.

`api/` mirrors the Adyen Checkout API — `sessions.js`, `payments.js`, `paymentsDetails.js`,
`paymentMethods.js`, `orders.js`, `donation.js`, `sessionPatch.js`, and others, plus `api/mock/`
for canned responses.

## Translations

`translations/en-US.json` is the **source of truth**. Every other locale mirrors its key
structure. Keys use dot-notation scoped by component: `card.number.label`, `pay.button`.

Translated copy comes from a **separate translations repo**, not from here. The non-`en-US` files
arrive as a single batch commit covering every locale at once. Treat them as generated output.

### Adding a key

Add it to `en-US.json` only, so the feature works and the key exists for the translation process
to pick up. Don't hand-write or machine-translate the other locales to close the gap — a partial
locale is worse than a missing one, because it silently ships wrong copy.

A translations-only change doesn't require a changeset — that requirement covers
`packages/lib/src/` only. It does re-run changeset validation, so any changeset already in the PR
still has to be well-formed.

### Adding a locale is a two-part change

`yarn validate:locales` compares the files in `translations/` against `CDN_SUPPORTED_LOCALES` in
`packages/lib/src/language/constants.ts` and fails on any mismatch in either direction. A new
`xx-XX.json` without the matching constant entry — or vice versa — fails the check.

## Safety

- Never edit a non-`en-US` locale file without an explicit translation process and approval.
- Never hardcode API keys — use environment variables.
- Never expose Adyen API credentials in a proxied response.
