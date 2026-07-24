---
'@adyen/adyen-web': minor
---

New: Include conditional funding source validation in the BinLookup. The validation is triggered by the new `allowedFundingSources` property in the scheme's `configuration` object in the /paymentMethods response.
