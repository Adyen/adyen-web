---
'@adyen/adyen-web': minor
---

Fixed: UPI component now includes the configured `mandate` object in the payment payload returned by `formatData()`, so the Advanced Flow `onSubmit` `state.data` carries the mandate for recurring UPI Autopay flows.