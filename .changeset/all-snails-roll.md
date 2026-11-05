---
'@adyen/adyen-web': minor
---

Improved: In the sessions flow, the Donation component now cancels the donation token when the shopper declines, and calls `onDonationSuccess({ didDonate: false })` once that request completes.
