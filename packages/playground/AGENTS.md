# Playground

Demo app for manually testing payment components end to end. Dev-only — never shipped.

## Commands

| Task                               | Command                                |
| ---------------------------------- | -------------------------------------- |
| Start (playground + library watch) | `yarn start` from the repo root        |
| Dev server                         | `localhost:3020`, override with `PORT` |

`yarn start` runs the library in watch mode alongside the playground, so library edits hot-reload.

## Boundaries

- **Owns**: `src/pages/` (one folder per flow — `Cards`, `Dropin`, `Wallets`, `ThreeDS`,
  `IssuerLists`, `QRCodes`, `Vouchers`, `GiftCards`, `OpenInvoices`, `Result`, …),
  `src/config/`, `src/services.js`, `src/handlers.js`, `src/utils.js`, `src/style/`.
- **May read**: the library build, and the mock server's API responses.
- **Never touches**: library source, E2E tests, Storybook.

## Conventions

- `services.js` posts to the **local mock server** (`packages/server`) via `httpPost`, which
  proxies to Adyen. The playground never calls Adyen directly and holds no credentials.
- `handlers.js` provides the shared callbacks — `handleSubmit`, `handleAdditionalDetails`,
  `handleChange`, `handleOnPaymentCompleted`, `handleOnPaymentFailed`, `handleError`. Reuse them
  instead of writing new ones per page.
- `src/config/` holds the request bodies (`paymentMethodsConfig`, `paymentsConfig`) shared by all
  pages.
- Page configuration mirrors the merchant-facing `CoreConfiguration` shape, which is the point —
  these pages double as integration examples.
- `services.js` merges the full `state.data` into the payment request as a shortcut. That is a
  playground convenience and is explicitly **not** a pattern to copy into production code or docs.

## Safety

- Never add production dependencies — this package is dev-only.
- Never commit real API keys or merchant credentials; they belong in the server's environment.
- Never put PCI-sensitive data in a demo configuration.
