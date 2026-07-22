---
'@adyen/adyen-web': patch
---

Fixed: Card CVC error announced by screen readers, and exposed via `state.errors.encryptedSecurityCode.errorI18n`, now correctly reflects Amex's 4-digit/front-of-card guidance instead of always using the non-Amex 3-digit/back-of-card text
