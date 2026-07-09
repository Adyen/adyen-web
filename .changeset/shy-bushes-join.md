---
'@adyen/adyen-web': minor
---

Improved: Detect if 3DS2 challenge token is missing a valid domain for the threeDSNotificationURL. Without a valid domain we will never receive the postMessage telling us the 3DS2 process is complete.
