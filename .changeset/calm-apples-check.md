---
'@adyen/adyen-web': patch
---

Fixed: Apple Pay now reports missing required configuration, such as `countryCode`, as an `IMPLEMENTATION_ERROR` instead of only logging a warning.
