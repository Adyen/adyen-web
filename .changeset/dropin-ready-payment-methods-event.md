---
'@adyen/adyen-web': minor
---

New: Drop-in emits a new `ready` analytics event reporting the payment methods it rendered (each with `displayMode`) in display order, plus the `/paymentMethods` items it did not render (`unavailablePaymentMethods`).
