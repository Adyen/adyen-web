---
"@adyen/adyen-web": patch
---

Sanitize `billingAddress` when making a `/payments` call. Remove `firstName` and `lastName` in the `billingAddress` for non Riverty payments.
