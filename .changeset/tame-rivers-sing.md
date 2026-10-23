---
'@adyen/adyen-web': patch
---

Fixed: a stale 3DS2 challenge `postMessage` listener no longer resolves after its component is removed from the DOM outside of Preact's lifecycle, preventing a duplicate `onAdditionalDetails`/`/paymentDetails` call.
