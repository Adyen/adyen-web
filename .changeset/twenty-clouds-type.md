---
'@adyen/adyen-web': minor
---

Update `showPayButton` property to default to `true` for both Components and Drop-in.

Previously it defaulted to `true` for Drop-in and `false` for Components (for legacy reasons, when we didn't have a separate PayButton component).
