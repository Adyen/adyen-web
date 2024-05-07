---
"@adyen/adyen-web": minor
---

Add upi intent flow to the UPI component. The upi intent flow is shown only on the mobile device if the upi intent app list is provided.
If the app list is not provided, we show the default `vpa` mode.
The drop-in component shows only one upi component if the parent `upi` tx_variant is found.
