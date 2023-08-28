---
'@adyen/adyen-web': patch
---

For some storedCards it is not allowed to store the expiryDate, so when this info is not present in the storedCardData, we hide the readonly expiryDate field
