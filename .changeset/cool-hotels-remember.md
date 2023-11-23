---
'@adyen/adyen-web': patch
---

For all PaymentMethodItems we were adding a class `adyen-checkout__payment-method--{fundingSource}` (where fundingSource was either "credit" or "debit")

This is meant to be a Card PM specific class to indicate, in the paymentMethods list, whether the card is a credit or debit card.
