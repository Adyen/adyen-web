---
'@adyen/adyen-web': minor
---

New: Drop-in emits a new `paymentListDisplayed` analytics event reporting the payment methods it rendered (`availablePaymentMethods`, each with `displayMode`) in display order, plus the `/paymentMethods` items it did not render (`unavailablePaymentMethods`).
