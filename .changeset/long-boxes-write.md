---
'@adyen/adyen-web': patch
---

Fixed: Null-safety in the SDK core, analytics and payment-methods processing, and `onAdditionalDetails` now types `component` as possibly `undefined` since it is not passed when called via `checkout.submitDetails()`.
