# EMI Plans Data Transformation

## Context and Problem Statement

The installment plans available to a shopper come from `POST /v72/paymentMethods/emi/plans` and are priced for a specific amount. In the advanced flow, the merchant calls this endpoint and passes the response to the SDK through the `plans` config prop. In the sessions flow, the SDK receives the plans from `checkoutShopper`.

The same response drives two dropdowns, a summary table, and the `emiPlan` object sent to `/payments`. We need to decide whether to keep that response intact or convert it into an SDK-specific view model.

## What the lookup returns

```jsonc
{
    "issuers": [
        {
            "issuerName": "HDFC Bank",
            "issuerCode": "HDFC",
            "fundingSource": "credit",
            "plans": [
                {
                    "type": "noCost",
                    "tenureMonths": 3,
                    "interestRateBps": 1550,
                    "transactionAmounts": {
                        "authorizationAmount": null,
                        "monthlyPayableAmount": { "value": 5880000, "currency": "INR" },
                        "totalPayableAmount": { "value": 16399900, "currency": "INR" },
                        "totalInterestAmount": { "value": 0, "currency": "INR" }
                    },
                    "offers": [
                        {
                            "offerId": "offer-hdfc-cashback",
                            "type": "CASHBACK",
                            "amount": { "value": 250000, "currency": "INR" },
                            "description": "Cashback"
                        },
                        {
                            "offerId": "offer-hdfc-nocost",
                            "type": "DISCOUNT",
                            "amount": { "value": 400000, "currency": "INR" },
                            "description": "No cost EMI"
                        }
                    ]
                },
                {
                    "type": "standard",
                    "tenureMonths": 6,
                    "interestRateBps": 1550,
                    "transactionAmounts": {
                        "monthlyPayableAmount": { "value": 2940000, "currency": "INR" },
                        "totalPayableAmount": { "value": 16899900, "currency": "INR" },
                        "totalInterestAmount": { "value": 1400000, "currency": "INR" }
                    }
                }
            ]
        }
    ]
}
```

The response carries _no id_, and _no flag for which plan or which offer to show first_. Those are the gaps the front end has to close.

## What the display needs

Amounts below are minor units, rendered `en-US`.

**A plan has to be selected before the shopper does anything.** The summary is part of the first paint, so the component preselects the first issuer and that issuer's first plan. There is no empty state and no "choose a plan" placeholder. Picking a provider selects that provider's first plan.

**A provider row describes the provider, not the selection.** Its tags and its discount are read from _all_ of that issuer's plans: every tagged plan type the issuer offers, ordered `noCost` then `lowCost`, and the largest offer found anywhere among its plans. They advertise what is available at that bank, so they hold still while the shopper moves through the bank's plans — selecting a `standard` plan at a bank that also offers a `lowCost` one leaves the `Low cost` tag on the provider row. Only the plan rows, the discount banner and the summary track the selection.

**Selection needs a key, and the response has none.** Two `<Select>` menus resolve a choice by id, and `Select` also puts that id in the DOM, as `listItem-<id>`. The key is composed of the fields that identify the payment itself, each unique within one response:

- a provider is one `(issuerCode, fundingSource)` pair — `issuer:HDFC:credit`
- a plan is one `(issuerCode, fundingSource, type, tenureMonths)` tuple — `plan:HDFC:credit:noCost:3`

Every segment is `encodeURIComponent`-ed before the segments are joined on `:`, so a value carrying the delimiter cannot read as another row's key, and the `issuer:` / `plan:` prefixes keep the two lists from naming the same DOM node. Row positions are not sufficient: they remain stable only while nothing is reordered, and the first row of both lists would answer to `listItem-0`.

The key is a select adapter and nothing else. The handlers trade it back for the `EmiIssuer` and `EmiPlan` the lookup returned, so the selection, the callbacks and `/payments` only ever see response objects. If the uniqueness above stops holding, the two helpers in `EMIPlanSelection.tsx` and this section change together.

**One discount is shown, and the same one is charged.** A plan can carry several offers. The design shows a single discount, so the largest wins, and ties keep the backend's order. `appliedOfferIds` takes a list, but we send only that one id, so the shopper is charged the discount they were quoted rather than a total no screen ever showed. `selectDisplayOffer` is the single decision point: display and payload both read it, and neither can drift from the other. Stacking discounts is a possible product change later, and it would change that one function, the summary and the payload together.

```ts
// Provider select
{
    id: 'issuer:HDFC:credit',
    name: 'HDFC Bank',
    icon: 'https://checkoutshopper-test.adyen.com/.../emi/hdfc.svg',
    tags: [{ label: 'No cost', variant: TagVariant.SUCCESS }],
    secondaryText: '-₹4,000.00 discount available'
}

// Plan select
{
    id: 'plan:HDFC:credit:noCost:3',
    name: '₹58,800.00 x 3 months',
    tags: [{ label: 'No cost', variant: TagVariant.SUCCESS }],
    secondaryText: '-₹4,000.00 discount available'
}
```

A no-cost plan hides the rate in its label but keeps the interest row, because the bank rate is real and the shopper is not charged it.

## What the payment request needs

`emiPlan` sits next to `paymentMethod`, where Card puts `installments`.

```jsonc
{
    "paymentMethod": { "type": "scheme", "encryptedCardNumber": "adyenjs_0_1_18$...", "...": "..." },
    "emiPlan": {
        "tenureMonths": 3,
        "issuerName": "HDFC",
        "fundingSource": "CREDIT",
        "planType": "NO_COST",
        "interestRateBps": 1550,
        "appliedOfferIds": ["offer-hdfc-nocost"]
    },
    "browserInfo": { "...": "..." },
    "clientStateDataIndicator": true
}
```

- `plan.type` is cast: `standard` → `STANDARD`, `noCost` → `NO_COST`, `lowCost` → `LOW_COST`.
- `issuer.fundingSource` is cast: `credit` → `CREDIT`, `debit` → `DEBIT`.
- `issuerName` is `issuerCode` as it arrived, because the backend compares it to the card BIN by exact string match. Never a lowercased copy of it, and never the `issuerName` the provider row displays: `HDFC Bank` would fail where `HDFC` succeeds.
- `tenureMonths` and `interestRateBps` are echoed from the selected plan, as JSON numbers.
- `appliedOfferIds` carries the single displayed offer, and is omitted rather than sent empty when the plan carries none.

`buildEmiPlanPayload` in `utils.ts` builds the object, and `EMI.formatData()` merges it in only once a plan is selected — a partial or placeholder `emiPlan` is never sent. Both casing tables live in `constants.ts`, as `PLAN_TYPE` and `ISSUER_FUNDING_SOURCE`.

## Considered options

### Option 1: Keep the API response

**Pros:**

- Simple, with the API response as the single data model
- Preserves all response fields
- Supports additive backend API evolution without mapper updates

**Cons:**

- Requires nested property access
- Requires realistic, nested test fixtures
- Requires derived selection keys

### Option 2: Convert the response into a view model

**Pros:**

- Can simplify reads with flattened properties
- Can centralize display formatting

**Cons:**

- Over-engineering for the MVP
- Introduces duplicate types and mapping code
- Requires mapper tests and separate fixtures
- Can drop fields during conversion
- Requires mapper updates for additive backend API changes

## Decision

Choose **Option 1: Keep the API response**.

The response already contains the domain data needed by the selectors, summary, and payment payload. The few UI-specific values can be derived where they are used. Keeping the response intact reduces code and, more importantly for an evolving MVP API, removes a conversion layer where fields could be dropped or changed by accident.

### Unsupported enum values require an SDK release

`type` and `fundingSource` are closed sets. If the backend adds a value that the installed SDK does not know how to map, that SDK cannot build a correct `/payments` payload. The change requires a new SDK version rather than a runtime filter that silently hides the plan.

Runtime filtering would change an explicit incompatibility into missing plans in the UI. Exhaustiveness is checked by TypeScript, in both directions: `PLAN_TYPE` and `ISSUER_FUNDING_SOURCE` satisfy `Record<EmiPlanTypeKey, EmiPlanPayloadType>` and `Record<EmiIssuerFundingSource, EmiPlanPayloadFundingSource>`, so a lookup value with no mapping is a missing key, while `EmiPayloadCasingIsExhaustive` fails the build for a payment-request value nothing maps onto. Adding a value to either side without its counterpart fails the build.
