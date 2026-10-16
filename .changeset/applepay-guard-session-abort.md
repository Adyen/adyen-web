---
'@adyen/adyen-web': patch
---

Fixed an issue where `ApplePaySession.abort()` throwing `InvalidAccessError` in the `onvalidatemerchant` catch handler (when Safari has already terminated the session, e.g. after the merchant validation deadline) prevented `onError` from being called, leaving the integration without any error callback.
