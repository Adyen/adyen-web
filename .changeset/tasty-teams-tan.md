---
'@adyen/adyen-web': patch
---

Some payment actions that lead to a call to `onAdditionalDetails`, when initiated via `checkout.createFromAction`, were seeing `onAdditionalDetails` being called without the `actions` object containing the `resolve` & `reject` functions, needed to complete the flow as detailed in our documentation 
