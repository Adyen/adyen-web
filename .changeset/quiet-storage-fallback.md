---
'@adyen/adyen-web': patch
---

Fixed: Checkout no longer fails to initialize when the browser storage is full and rejects writes with QuotaExceededError.
