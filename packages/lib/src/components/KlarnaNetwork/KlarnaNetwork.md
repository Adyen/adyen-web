# Klarna Network — Web SDK proof of concept

Renders Klarna's Network Distribution Web SDK inside adyen-web and authorizes the payment with the
session token the SDK mints, rather than sending the shopper to Klarna's hosted page.

The frontend is complete. The payment cannot finish yet, for one reason documented under
[The gap](#the-gap).

---

## How the flow works

1. The component loads Klarna's Web SDK from their CDN and initialises it with `clientId`,
   `partnerAccountId` and `acquiringConfig.paymentAccountId`.
2. `Payment.presentation()` returns the payment option for the current amount and currency. The
   component mounts Klarna's message and native pay button; Adyen owns the surrounding UI.
3. The shopper clicks Klarna's button. The SDK opens its purchase-journey window and calls the
   `initiate` callback with a `klarnaNetworkSessionToken`.
4. The callback posts to Adyen `/payments`:

    ```json
    {
        "paymentMethod": {
            "type": "klarna_network",
            "klarnaNetworkSessionToken": "krn:network:us1:test:session-token:...",
            "klarnaNetworkPaymentAccountId": "..."
        }
    }
    ```

5. Adyen calls Klarna's `payment/authorize`. When Klarna answers `STEP_UP_REQUIRED`, the response
   carries a Payment Request whose URL the SDK uses to run the journey in context.
6. The callback returns that URL to Klarna, which completes the purchase without leaving the page.

Steps 1–4 work today. Step 5 does not.

---

## The gap

Klarna decides how a step-up is delivered from `step_up_config.method` on the authorize call:

| Value      | Behaviour                                                      |
| ---------- | -------------------------------------------------------------- |
| `HANDOVER` | The acquirer redirects the shopper to the payment request URL. |
| `SDK`      | The Klarna Web SDK launches the journey itself.                |

**Adyen does not send `SDK`.** Klarna therefore answers `PENDING` with a `redirect_url` instead of
`STEP_UP_REQUIRED` with a `payment_request`, and `/payments` returns an ordinary redirect action:

```json
{
    "resultCode": "RedirectShopper",
    "action": {
        "type": "redirect",
        "paymentMethodType": "klarna_network",
        "url": "https://checkoutshopper-test.adyen.com/checkoutshopper/checkoutPaymentRedirect?redirectData=..."
    }
}
```

Wrapping a `redirect_url` like this is correct Adyen behaviour — the wrapper is a symptom, not the
cause. There was never a payment request URL to return. The Web SDK reads the region and access
token straight out of the URL it is handed, so the opaque wrapper can never work and Klarna fails
the journey with `VALIDATION_ERROR / PaymentError`.

### What the backend needs to change

1. Send `step_up_config.method = 'SDK'` on `payment/authorize`.
2. Return the resulting `payment_request_url` as an `sdk` action instead of a wrapped redirect:

    ```json
    {
        "action": {
            "type": "sdk",
            "paymentMethodType": "klarna_network",
            "sdkData": { "paymentRequestUrl": "https://..." }
        }
    }
    ```

Step 2 is meaningless without step 1.

The `klarna_network` tx variant only ever runs this flow, so the presence of the variant is itself
the signal to use `SDK` mode. No extra request field is needed.

A `redirect` action carrying the raw Klarna URL would also be readable by the SDK, but it would
make Drop-in, `handleAction` and `onAction` navigate the shopper away — exactly what the in-context
journey exists to avoid. Hence the `sdk` action.

---

## What is known, and how

Most of the request contract was recovered from validation errors rather than documentation. Treat
it as observed, not contractual.

| Fact                                                                            | Source                                          |
| ------------------------------------------------------------------------------- | ----------------------------------------------- |
| `klarna_network` is a real, shipped tx variant                                  | Internal acquirer documentation                 |
| `/paymentMethods` returns `{ name: 'Pay with Klarna', type: 'klarna_network' }` | Observed                                        |
| An icon asset is published for `klarna_network`                                 | Adyen CDN returns 200                           |
| `KlarnaNetworkDetails` accepts `klarnaNetworkSessionToken`                      | Validation error naming other fields            |
| `klarnaNetworkPaymentAccountId` is required                                     | `422` "Required field … is not provided"        |
| `paymentOptionId` is not a field                                                | `422` "unknown fields: [paymentOptionId]"       |
| Adyen does not send `step_up_config.method = 'SDK'`, but can                    | Backend discussion — **unconfirmed in writing** |

### Open questions for Klarna

1. May an acquiring partner use the Web SDK `initiate` flow at all, or is the server-side redirect
   model the intended integration? This gates everything else.
2. Is the payment account provisioned for `SDK` step-ups?
3. Does returning `{ paymentRequestId }` from `initiate` work on its own? A bare id carries neither
   the region nor the access token the SDK derives from the URL. `getSdkHandover` reads it
   opportunistically, but it is **unverified** — it comes from the SDK's own
   `INVALID_CALLBACK_RESPONSE` message, not the docs.
4. Is `Payment.on('complete', …)` deprecated in favour of `Payment.onComplete(…)`? The reference
   lists `onComplete`, `onError`, `onAbort` and `off`, but no `on`.
5. Is building the button from `presentation.paymentOption.paymentButton` still current, or should
   `Payment.button()` be used?

---

## Notes on the implementation

**`initiate` has no "nothing to do" return.** It must resolve with `{ returnUrl }`,
`{ paymentRequestUrl }`, `{ paymentRequestId }` or `{ currency, … }`. Returning `{}` fails with
`INVALID_CALLBACK_RESPONSE`.

**`paymentOptionId` is dropped.** Klarna hands it to `initiate`, but `KlarnaNetworkDetails` rejects
it, so Adyen must resolve the chosen payment option from the session token.

**The Web SDK cannot be bundled.** Klarna requires it to be fetched from their CDN at runtime,
which is why `load-klarna-sdk.ts` holds the URL in a variable — otherwise webpack, Vite and Rollup
try to resolve it at build time.

**Currency selects Klarna's region.** The test accounts are NA only: `USD` reaches `/na`, `EUR`
answers `404 RESOURCE_NOT_FOUND` on `/eu`. Stories default to `US`.

**Credentials are entered in-story** rather than through Storybook args, because args are mirrored
into the URL and would end up in browser history and shared links.
