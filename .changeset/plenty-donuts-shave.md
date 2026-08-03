---
'@adyen/adyen-web': minor
---

New: Drop-in now honours an optional `displayMode` property inside the `configuration` object of payment methods in the `/paymentMethods` response. When any payment method carries `configuration.displayMode`, Drop-in uses it to decide which methods render in the instant payments area and the `instantPaymentTypes` configuration is ignored. Responses without `displayMode` are unaffected.
