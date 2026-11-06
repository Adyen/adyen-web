---
'@adyen/adyen-web': patch
---

Fixed: Calling `actions.reject()` in `beforeSubmit` no longer triggers `onPaymentFailed` for Apple Pay, Google Pay, Amazon Pay and ANCV.
