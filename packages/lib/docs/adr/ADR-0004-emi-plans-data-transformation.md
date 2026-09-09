# EMI Plans Data Ownership

## Context and Problem Statement

The installment plans available to a shopper are priced for a specific amount and come from a checkoutShopper endpoint the SDK calls itself, in both the sessions and the advanced flow, authenticated by the client key and an opaque token delivered on the `emi` entry of the payment methods list.

One response drives two dropdowns, a discount banner, a summary table and the `emiPlan` object sent to `/payments`.

The question this ADR answers is not whether to convert that response into a view model. It is **which side of the wire owns each value the screen shows**. Phase 2 shipped with the SDK deriving six of them:

| Derived value                               | Where                                               |
| ------------------------------------------- | --------------------------------------------------- |
| A key for each row of the two dropdowns     | `getIssuerId` / `getPlanId`, `EMIPlanSelection.tsx` |
| The tags on a provider row                  | `getIssuerTags`, `EMIPlanSelection.tsx`             |
| The discount on a provider row              | `getIssuerDiscountText`, `EMIPlanSelection.tsx`     |
| Which offer of a plan is shown, and charged | `selectDisplayOffer`, `utils.ts`                    |
| Which plan is selected on first paint       | `getDefaultSelection`, `EMIComponent.tsx`           |
| The amount reserved on the card             | `EMIPlanSummary.tsx`, read from the checkout amount |

Three of those are presentation. Three are policy — statements about what a bank offers and what the shopper will be charged — and the SDK has no authority to make them.

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
                        "monthlyPayableAmount": { "value": 5880000, "currency": "INR" },
                        "totalPayableAmount": { "value": 16399900, "currency": "INR" },
                        "totalInterestAmount": { "value": 0, "currency": "INR" }
                    },
                    "offers": [
                        { "offerId": "offer-hdfc-cashback", "amount": { "value": 250000, "currency": "INR" }, "description": "Cashback" },
                        { "offerId": "offer-hdfc-nocost", "amount": { "value": 400000, "currency": "INR" }, "description": "No cost EMI" }
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

The response carries no id, no flag for which plan to show first, and no flag for which offer of the two above the bank will honour. Those are the gaps.

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
        "issuerCode": "HDFC",
        "fundingSource": "credit",
        "planType": "noCost",
        "interestRateBps": 1550,
        "appliedOfferIds": ["offer-hdfc-nocost"]
    },
    "browserInfo": { "...": "..." },
    "clientStateDataIndicator": true
}
```

The SDK builds `emiPlan` from the selected issuer and plan:

- `tenureMonths` and `interestRateBps` are copied as numbers.
- `issuerCode`, `fundingSource`, and `planType` are copied unchanged.
- `appliedOfferIds` contains the offers applied to the selected plan.
- `appliedOfferIds` is omitted when no offer is applied.

## Decision Drivers

- **Quote accuracy** — The payment request must use the offers shown to the shopper.
- **Product ownership** — The acquirer decides which offers apply and what a provider advertises.
- **Release independence** — Discount rules should change without an SDK release.
- **Backwards compatibility** — New API values must not break older SDK versions.
- **Localization** — The SDK keeps control of shopper-facing copy and amount formatting.
- **Simplicity** — Avoid a separate view model and mapping layer.

## Considered Options

- **Option 1:** Keep the current implementation, where the SDK owns the business logic.
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
- Changing discount rules requires an SDK release

---

### Option 2: API returns policy fields

Add these fields to the response:

- `issuer.availablePlanTypes`
- `issuer.maxOfferAmount`
- `offers[].applied`

```jsonc
{
    "issuers": [
        {
            "issuerName": "HDFC Bank",
            "issuerCode": "HDFC",
            "fundingSource": "credit",
            "availablePlanTypes": ["noCost", "standard"],
            "maxOfferAmount": { "value": 400000, "currency": "INR" },
            "plans": [
                {
                    "type": "noCost",
                    "tenureMonths": 3,
                    "interestRateBps": 1550,
                    "transactionAmounts": {
                        "monthlyPayableAmount": { "value": 5880000, "currency": "INR" },
                        "totalPayableAmount": { "value": 16399900, "currency": "INR" },
                        "totalInterestAmount": { "value": 0, "currency": "INR" }
                    },
                    "offers": [
                        {
                            "offerId": "offer-hdfc-cashback",
                            "amount": { "value": 250000, "currency": "INR" },
                            "description": "Cashback",
                            "applied": false
                        },
                        {
                            "offerId": "offer-hdfc-nocost",
                            "amount": { "value": 400000, "currency": "INR" },
                            "description": "No cost EMI",
                            "applied": true
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

The SDK continues to use the response directly.

**Pros:**

- The acquirer controls which offers are applied
- The UI and `/payments` use the same applied offers
- Supports zero, one, or several applied offers
- Discount rules can change without changing SDK logic
- Removes issuer-level discount calculations and offer selection logic
- No view model or mapping layer

**Cons:**

- `availablePlanTypes` duplicates information from `plans[].type`
- The API must keep the new fields compatible
- The SDK cannot use this behavior until the backend fields are available

#### Ownership

| Value                                 | Owner       | Source                                            |
| ------------------------------------- | ----------- | ------------------------------------------------- |
| Provider row identity                 | SDK         | `(issuerCode, fundingSource)`                     |
| Plan row identity                     | SDK         | `(issuerCode, fundingSource, type, tenureMonths)` |
| Provider plan-type tags               | API         | `issuer.availablePlanTypes`                       |
| Provider discount                     | API         | `issuer.maxOfferAmount`                           |
| Applied offers                        | API         | `offers[].applied`                                |
| Plan discount, banner, and summary    | SDK         | Sum of applied offer amounts                      |
| `appliedOfferIds` sent to `/payments` | SDK         | IDs of applied offers                             |
| Default issuer and plan               | API and SDK | API order; SDK selects the first item             |
| Labels and amount formatting          | SDK         | `i18n`                                            |
| Amount reserved on the card           | SDK         | Checkout amount                                   |

#### Response Contract

- `availablePlanTypes` is a superset of the types in the issuer's `plans`.
- The SDK displays only plan types it knows. Unknown types remain selectable.
- `maxOfferAmount` is the provider-level discount shown in the provider row.
- Every offer has an `applied` flag.
- A plan can have zero, one, or several applied offers.
- Issuers and plans arrive in display order.
- The first plan for an issuer is the default plan for that issuer.
- Issuer and plan identity tuples are unique within one response.
- `transactionAmounts` does not change as part of this decision.
- New enum values are additive. The SDK passes unknown selected values to `/payments` unchanged.
- The API does not return shopper-facing labels or formatted amounts.

#### Current State

Until the backend fields are available, the Phase 2 SDK derivations remain in place. Moving to the fields in this ADR is handled by a separate implementation ticket.

---

## Comparison Summary

| Criteria                            | Option 1 | Option 2 |
| ----------------------------------- | -------- | -------- |
| Applied-offer owner                 | SDK      | API      |
| Supports stacked offers             | No       | Yes      |
| Requires new API fields             | No       | Yes      |
| Requires response mapping           | No       | No       |
| Product changes need an SDK release | Yes      | No       |
| Implementation complexity           | Low      | Low      |

## Decision Outcome

Chosen option: **Option 2 - API returns policy fields and the SDK consumes the response directly.**

The API owns product policy. The SDK owns presentation and payload construction. A view model is not needed because the response already contains the values required by the UI and `/payments`.
