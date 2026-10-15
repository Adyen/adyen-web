# EMI Plans Data Ownership

## Context and Problem Statement

The installment plans available to a shopper are priced for a specific amount and come from a checkoutShopper
endpoint the SDK calls itself, in both the sessions and the advanced flow, authenticated by the client key and
an opaque token delivered on the `emi` entry of the payment methods list.

One response drives two dropdowns, a summary table and the `emiPlan` object sent to
`/payments`.

The question this ADR answers is not whether to convert that response into a view model. It is **which side of
the wire owns each value the screen shows**. Phase 2 shipped with the SDK deriving seven of them:

| Derived value                               | Where                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A key for each row of the two dropdowns     | `getIssuerId` / `getPlanId`, `EMIPlanSelection.tsx`                                        |
| The tags on a provider row                  | `getIssuerTags`, `EMIPlanSelection.tsx`                                                    |
| The discount on a provider row              | `selectInstantDiscount`, `utils.ts`, the largest instant discount of its plans             |
| Which offer of a plan is shown, and charged | `selectDisplayOffer`, `utils.ts`                                                           |
| Which plan is selected on first paint       | `getDefaultSelection`, `EMIComponent.tsx`, plus `withPlansSortedByTenure` in `utils.ts`    |
| The amount reserved on the card             | `EMIPlanSummary.tsx`, the checkout amount less the interest offer and the instant discount |
| The terms and conditions page of the bank   | `ISSUER_TERMS_URLS`, `constants.ts`, keyed by `issuerCode`                                 |

Three of those are presentation. Four are policy — statements about what a bank offers and what the shopper
will be charged — and the SDK has no authority to make them.

## What the lookup returns

```jsonc
{
    "issuers": [
        {
            "issuerName": "HDFC Bank",
            "issuerCode": "HDFC",
            "fundingSource": "credit",
            "availablePlanTypes": ["noCost", "standard"],
            "bestOffer": { "value": 400000, "currency": "INR" },
            "plans": [
                {
                    "type": "noCost",
                    "tenureMonths": 3,
                    "interestRateBps": 1550,
                    "transactionAmounts": {
                        "authorizationAmount": { "value": 15099900, "currency": "INR" },
                        "monthlyPayableAmount": { "value": 5033300, "currency": "INR" },
                        "totalPayableAmount": { "value": 15099900, "currency": "INR" },
                        "totalInterestAmount": { "value": 0, "currency": "INR" },
                        "totalInstantDiscountAmount": { "value": 400000, "currency": "INR" },
                        "interestDiscountAmount": { "value": 400000, "currency": "INR" }
                    },
                    "processingAmounts": {
                        "totalAmount": { "value": 35282, "currency": "INR" },
                        "feeAmount": { "value": 29900, "currency": "INR" },
                        "taxAmount": { "value": 5382, "currency": "INR" },
                        "type": "absolute",
                        "message": "299 + GST is Applicable"
                    },
                    "offers": [{ "offerId": "offer-hdfc-nocost", "type": "DISCOUNT", "description": "No cost EMI" }]
                },
                {
                    "type": "standard",
                    "tenureMonths": 6,
                    "interestRateBps": 1550,
                    "transactionAmounts": {
                        "authorizationAmount": { "value": 15499900, "currency": "INR" },
                        "monthlyPayableAmount": { "value": 2816650, "currency": "INR" },
                        "totalPayableAmount": { "value": 16899900, "currency": "INR" },
                        "totalInterestAmount": { "value": 1400000, "currency": "INR" }
                    },
                    "processingAmounts": {
                        "totalAmount": { "value": 35282, "currency": "INR" },
                        "feeAmount": { "value": 29900, "currency": "INR" },
                        "taxAmount": { "value": 5382, "currency": "INR" },
                        "type": "absolute",
                        "message": "299 + GST is Applicable"
                    }
                }
            ]
        }
    ]
}
```

Every amount on a plan is quoted by the acquirer and rendered as it arrives. The SDK performs no arithmetic on
them: `authorizationAmount` is what the card is charged now, `totalInstantDiscountAmount` and
`interestDiscountAmount` are the two discount rows of the summary, and `totalPayableAmount` is what the plan
costs over its tenure.

`processingAmounts.message` is shopper-facing copy the backend words itself, rendered verbatim above the terms
line and never translated by the SDK. It is un-localised today and is being reworked separately.

### What the SDK renders of it

Every issuer of the response, in the order it arrives. The SDK does not filter by `fundingSource` or drop
issuers: which issuers a shopper is offered is policy, and the backend returns only those this version can
render. An empty `issuers` list is the same outcome as an amount with no plans: see
[Loading and failure handling](#loading-and-failure-handling).

## Payment Request

`emiPlan` sits next to `paymentMethod`, where Card puts `installments`.

```jsonc
{
    "paymentMethod": {
        "type": "scheme",
        "encryptedCardNumber": "adyenjs_0_1_18$...",
        "...": "..."
    },
    "emiPlan": {
        "tenureMonths": 3,
        "issuerName": "HDFC",
        "fundingSource": "credit",
        "planType": "NO_COST",
        "interestRateBps": 1550,
        "appliedOfferIds": ["offer-hdfc-nocost"]
    },
    "browserInfo": { "...": "..." },
    "clientStateDataIndicator": true
}
```

The SDK builds `emiPlan` from the selected issuer and plan:

- `tenureMonths` and `interestRateBps` are copied as numbers.
- `fundingSource` is copied unchanged.
- `issuerName` carries `EmiIssuer.issuerCode` (`HDFC`, not `HDFC Bank`). The request field is named after the
  name but holds the code, because the backend matches it against the card BIN by string equality.
- `planType` is the upper snake case of the lookup's plan type: `noCost` travels as `NO_COST`. The payments
  contract is being aligned to accept the lookup's spelling; the conversion goes away when it does.
- `appliedOfferIds` is every `offerId` of the plan's `offers`, in the order they arrived, and is omitted when
  the plan carries none. The SDK chooses nothing: everything the plan lists was priced into its amounts.

## Decision Drivers

- **Quote accuracy** — The payment request must use the offers shown to the shopper.
- **Product ownership** — The acquirer decides which offers apply and what a provider advertises.
- **Release independence** — Discount rules should change without an SDK release.
- **Backwards compatibility** — New API values must not break older SDK versions.
- **Localization** — The SDK keeps control of shopper-facing copy and amount formatting.
- **Simplicity** — Avoid a separate view model and mapping layer.

## Considered Options

- **Option 1:** Keep the Phase 2 implementation, where the SDK owns the business logic.
- **Option 2:** Move the business logic to the API and let the SDK consume the provided values.

## Pros and Cons of the Options

### Option 1: SDK derives policy

This is the Phase 2 implementation.

**Pros:**

- No new API fields
- No response mapping layer
- Works with the current endpoint response

**Cons:**

- The SDK guesses which offer the acquirer will apply
- Only one offer can be selected, even when offers can stack
- Provider tags and discounts are inferred from plan data
- The SDK sorts the plans, so it also decides which one the shopper sees first
- Changing discount rules requires an SDK release

---

### Option 2: API returns policy fields

The acquirer prices each plan and states what a provider advertises. The response gains
`issuer.availablePlanTypes`, `issuer.bestOffer`, `transactionAmounts.authorizationAmount` and
`transactionAmounts.interestDiscountAmount`, drops the per-offer `amount` and `applied` flag, arrives in
display order, and the SDK consumes it directly.

**Pros:**

- The acquirer controls which offers are applied
- The UI and `/payments` use the same applied offers
- Supports zero, one, or several applied offers
- Discount rules and display order change without an SDK release
- Removes issuer-level discount calculations, offer selection and plan sorting from the SDK
- No view model or mapping layer

**Cons:**

- `availablePlanTypes` duplicates information from `plans[].type`
- The API must keep the new fields compatible
- The SDK cannot use this behavior until the backend fields are available

#### Ownership

| Value                                 | Owner | Source                                                                       |
| ------------------------------------- | ----- | ---------------------------------------------------------------------------- |
| Provider row identity                 | SDK   | `(issuerCode, fundingSource)`                                                |
| Plan row identity                     | SDK   | `(issuerCode, fundingSource, type, tenureMonths)`                            |
| Provider plan-type tags               | API   | `issuer.availablePlanTypes`                                                  |
| Provider discount                     | API   | `issuer.bestOffer`                                                           |
| Applied offers                        | API   | `plan.offers`, whose membership means applied                                |
| Plan discount and summary             | API   | `transactionAmounts.totalInstantDiscountAmount` and `interestDiscountAmount` |
| Amount reserved on the card           | API   | `transactionAmounts.authorizationAmount`                                     |
| `appliedOfferIds` sent to `/payments` | SDK   | Every `offerId` of `plan.offers`, unchanged                                  |
| Issuer and plan display order         | API   | Response order, plans ascending by `tenureMonths`                            |
| Default issuer and plan               | SDK   | The first issuer, and that issuer's first plan                               |
| Which issuers are offered             | API   | Every issuer of `issuers`, unfiltered                                        |
| Labels and amount formatting          | SDK   | `i18n`                                                                       |
| Terms and conditions page of the bank | API   | `issuer.termLink`, linked only when it is an `https` URL                     |

#### Response Contract

- `availablePlanTypes` is a superset of the types in the issuer's `plans`.
- The SDK displays only plan types it knows. Unknown types remain selectable.
- `bestOffer` is the largest `totalInstantDiscountAmount` among the issuer's plans, and is the discount shown
  on the provider row.
- `issuers` is always an array, empty when no plan is available for the amount, and lists only issuers the
  shopper can be offered.
- Every issuer carries at least one plan. An issuer with no plans is not returned.
- Issuers arrive in display order, and an issuer's plans arrive in display order, ascending by `tenureMonths`.
  The order is stable across identical requests.
- The SDK preselects the first issuer and that issuer's first plan, so the first plan of an issuer is its
  default. Switching provider activates that provider's first plan.
- Every offer a plan lists was priced into that plan's amounts. There is no `applied` flag: membership of
  `offers` is what says the offer applies. The SDK never chooses among them and never derives a discount from
  them, because the amounts are authoritative; it echoes every `offerId` to `/payments` unchanged.
- An offer carries no amount. `type` and `description` are informational and the SDK renders neither.
- Issuer and plan identity tuples are unique within one response.
- Amounts are minor units and every plan in one response is quoted in the request's currency.
- New enum values are additive. The SDK passes unknown selected values to `/payments` unchanged.
- The API does not return shopper-facing labels or formatted amounts, other than
  `processingAmounts.message`.
- Absent optional fields are omitted, not `null`: an issuer without a discount has no `bestOffer`, and a plan
  without offers has no `offers`.
- `processingAmounts.type` is `absolute` or `percentage`. A `percentage` fee also carries `maxAmount`, the cap
  the fee is held to. The SDK renders the fee through `processingAmounts.message` only.
- Errors are problem details: `type`, `title`, `status`, `errorCode`, an optional `detail`, and, for a field
  the backend rejects, `invalidFields` entries of `name`, `value` and `message`. They carry no `errorType` and
  no `message`. A token the backend cannot decode, expired ones included, answers 422 `999_422_001` with
  `invalidFields` naming `emiToken`. A missing or blank token answers 422, either `29_001` naming `emiToken` or
  `999_422_000` naming no field; the test environment returns both.

#### Typing

Every field the contract above guarantees is typed as required, with no optional marker and no defensive
branch behind it. `EmiIssuer.plans` is non-empty, `EmiSelection` always resolves, and the summary renders
every amount it is given rather than filtering absent ones. Only genuinely conditional values —
`totalInstantDiscountAmount`, `interestDiscountAmount`, `offers` — stay optional, because a plan without a
discount or an offer is a real state rather than a missing field.

---

## Comparison Summary

| Criteria                            | Option 1 | Option 2 |
| ----------------------------------- | -------- | -------- |
| Applied-offer owner                 | SDK      | API      |
| Display-order owner                 | SDK      | API      |
| Supports stacked offers             | No       | Yes      |
| Requires new API fields             | No       | Yes      |
| Requires response mapping           | No       | No       |
| Product changes need an SDK release | Yes      | No       |
| Implementation complexity           | Low      | Low      |

## Decision Outcome

Chosen option: **Option 2 - API returns policy fields and the SDK consumes the response directly.**

The API owns product policy and display order. The SDK owns presentation, the selection behaviour, and
payload construction. A view model is not needed because the response already contains the values required by
the UI and `/payments`.

### Consequences

The Phase 2 derivations listed at the top are deleted rather than reworked:

- `selectDisplayOffer` and `selectInstantDiscount` go, together with `INTEREST_DISCOUNT_PLAN_TYPES`. The
  summary reads `interestDiscountAmount` and `totalInstantDiscountAmount`, the provider row reads
  `bestOffer`, and the payload maps every `offerId` instead of picking the largest offer.
- `withPlansSortedByTenure` goes. The response arrives in display order, which is the one place that order is
  decided.
- The reserved-amount arithmetic in `EMIPlanSummary` goes, replaced by `authorizationAmount`.
- `getIssuerTags` reads `availablePlanTypes` instead of walking the plans.

`getDefaultSelection` stays. Preselecting the first row is a presentation rule, and keeping it on the SDK
means the API expresses the default by ordering rather than by a flag that would need its own validation.

`ISSUER_TERMS_URLS` goes too. The terms copy links `issuer.termLink` when the issuer carries an `https` URL, and
renders unlinked otherwise, so the link appears without an SDK release once the backend returns it.

The `plans` and `supportedPaymentMethods` configuration props go. The SDK fetches the plans itself, in both
flows, so merchants no longer proxy the Checkout API lookup, and reads the supported payment methods and the
`emiToken` from the `emi` entry of the payment methods response. `EMIConfiguration` loses both props rather
than deprecating them, because EMI has not shipped publicly.

## Loading and failure handling

### When the plans load

The plans load when the EMI view mounts: when the shopper opens the EMI tile in Drop-in, and when the
standalone component is mounted. Drop-in renders a payment method only once its tile is selected, so one code
path covers both contexts and Drop-in needs no change. The request is made once per element: the promise is
memoized, and a later render, such as re-opening the tile, starts from the settled outcome without a spinner.

The request posts `{ "emiToken": "..." }`, taken from `configuration.emiToken` of the `emi` entry, with the
client key as a query parameter, to `utility/v1/emi/plans` on checkoutShopper, and times out after 10 seconds rather than the 60-second default, because the
shopper is watching a spinner while it runs. A missing token is still sent, so the backend records the
misconfiguration.

### Why not in `isAvailable()`

Drop-in races every element's `isAvailable()` against a timeout and silently drops the ones that reject.
Fetching there would remove the EMI tile whenever the endpoint fails, and would fetch for every shopper who
loads Drop-in, including those who never open EMI. `isAvailable()` keeps only its synchronous configuration
check: it rejects when the `emi` entry lists no payment method the SDK renders, and resolves otherwise.

### Outcomes

| Outcome                                                         | Screen                               | Analytics                                    |
| --------------------------------------------------------------- | ------------------------------------ | -------------------------------------------- |
| At least one issuer                                             | The plan selection and the card form | `selected` and `displayed` events, unchanged |
| An empty `issuers` list                                         | The spinner stays                    | Info event `validationError`, code 949       |
| Token rejected as missing, forged or expired (names `emiToken`) | The spinner stays                    | Error event, network, code 629               |
| Any other failure, including the timeout                        | The spinner stays                    | Error event, network, code 630               |

An expired token has no code of its own. The backend answers it exactly as it answers a forged one, so that a
caller cannot probe which tokens were ever valid, and the SDK reports both as 629.

The error event's `message` always names the endpoint, `EMI: /utility/v1/emi/plans`, followed by what is known
about the failure:

| Failure                               | Message                                                        |
| ------------------------------------- | -------------------------------------------------------------- |
| A backend answer                      | `EMI: /utility/v1/emi/plans (500): An internal error happened` |
| The 10-second timeout                 | `EMI: /utility/v1/emi/plans: signal timed out`                 |
| A network or CORS failure             | `EMI: /utility/v1/emi/plans: Failed to fetch`                  |
| An error page that is not JSON        | `EMI: /utility/v1/emi/plans: Unexpected token '<', ...`        |
| No `clientKey`, so no request is made | `EMI: /utility/v1/emi/plans`                                   |

The status and `title` come from the backend answer. The status tells a backend failure (5xx) from a rejected
request (4xx) within code 630. An error page that is not JSON carries no readable status, because `http` does
not pass the HTTP status on. The `requestId` is left out so that events group by message, and field values and
`detail` are never forwarded, because the backend has echoed the full token in `invalidFields[].value`.

When the request gets no readable answer, the message forwards the `message` of the error the fetch rejected
with. That text is written by the browser, so the same failure reads differently per browser: a network
failure is `Failed to fetch` in Chrome and `Load failed` in Safari. Chrome's `SyntaxError` quotes the first
characters of the body it could not parse.

### Why the spinner stays

No component in the SDK renders a "payment method unavailable" screen when its dependency fails. PayPal and
AmazonPay keep their spinner when their script fails to load, and EMI follows them rather than inventing a
screen. The card form and the pay button stay hidden while the spinner is shown, so nothing can be paid
without a plan, and in Drop-in the shopper can still pick another method. There is no retry and no `onError`:
adding `onError` later is additive for merchants, while removing it after release would change behaviour they
may rely on. The error screens, and whether to retry, are left to Phase 4.

### Open at the time of writing

Tracked in the backend review of the checkoutShopper endpoint, and none of them changes the decision above:

- the sessions setup response carries the `emiToken` on its `emi` entry but not `supportedPaymentMethods`,
  so `isAvailable()` rejects EMI in the sessions flow until the backend adds it;
- a missing or blank token answers `999_422_000` naming no field on some requests, which reports as 630
  rather than 629;
- `/paymentMethods` returns the `emi` entry for an amount below its `configuration.minAmount`, and the plans
  request then answers an empty `issuers` list, so the shopper sees the spinner and the SDK sends 949;
- `blockedPaymentMethods: ["emi"]` leaves the `emi` entry in place, and the entry follows the methods it
  wraps: it is dropped only when no `supportedPaymentMethods` survive the allow and block lists;
- whether `/payments` honours several applied offers on one plan, now that the SDK sends every id rather
  than the largest one;
- when the backend starts returning `issuer.termLink`;
- the rework of `processingAmounts.message`, which the SDK renders verbatim until then.
