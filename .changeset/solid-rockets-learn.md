---
'@adyen/adyen-web': patch
---

Fix(GooglePay): Prevent transactionInfo override of formatted amount

When making a payment request to google pay, `getTransactionInfo` fn incorrectly returns the unformatted `totalPrice` provided in `transactionInfo` instead of the formatted value derived from `amount`. Return object now spreads `props.transactionInfo` first so formatted values take precedence.


```
const googlePayConfig = {
    // ...
    transactionInfo: {
        // ...
        totalPrice: 12.34, // <-- value sent to google 
    },
    amount: {
        value: 1234, // <-- value is ignored
        currency: "USD"
    }
}

const component = new GooglePay(adyenCheckout, googlePayConfig);```

