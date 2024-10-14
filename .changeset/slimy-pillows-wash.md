---
"@adyen/adyen-web": minor
---

For the following QR based payments - `bcmc_mobile`, `duitnow`, `payme`, `paynow`, `pix`, `promptpay`, `swish` and `wechatpayQR`, we improved how we calculate the countdown time.

Specifically, we calculate the QR countdown time based on the `expiresAt` timestamp from the `/payments` response if it is returned in the action object, otherwise we use merchant's frontend configuration. 
If both are not presented, we fall back to the default value.