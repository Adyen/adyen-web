---
'@adyen/adyen-web': minor
---

New: Drop-in now honours a custom `displayMode`, an optional property inside the `configuration` object of payment methods in the `/paymentMethods` response. When any payment method carries a valid `configuration.displayMode`, Drop-in uses it to decide which methods render in the instant payments section and the `instantPaymentTypes` configuration is ignored. Responses without `displayMode` are unaffected.
