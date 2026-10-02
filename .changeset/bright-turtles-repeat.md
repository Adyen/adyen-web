---
'@adyen/adyen-web': patch
---

Fixed: Apple Pay `completePayment` being re-invoked with the thrown exception when the payment sheet could no longer be completed, which caused unhandled promise rejections
