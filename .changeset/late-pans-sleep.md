---
'@adyen/adyen-web': patch
---

[FIX] Fixes regression introduced in `v6.24.0` which meant that if `onAdditionalDetails` was defined directly on the Card component, and was not defined where it should be, as a Checkout level config prop - it would fail to fire
