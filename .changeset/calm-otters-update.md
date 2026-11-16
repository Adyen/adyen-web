---
'@adyen/adyen-web': patch
---

Fixed: Calling `checkout.update({ secondaryAmount }, { shouldReinitializeCheckout: false })` without an `amount` now falls back to the current amount instead of cancelling the update with an "Invalid amount object" warning.
