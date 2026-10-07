---
'@adyen/adyen-web': minor
---

New: India payment method Equated Monthly Installment (EMI). This version covers credit card EMI: it renders the card form, and fetches the installment plans itself when the shopper opens the EMI tile in Drop-in, or when the standalone component mounts, using the `emiToken` of the `emi` entry in the payment methods response. Only credit issuers are offered. Issuers on any other funding source, and payment methods other than cards, are left out rather than rendered, so this version keeps offering credit card plans as the API grows.
