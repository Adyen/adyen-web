---
'@adyen/adyen-web': minor
---

All actions lead to a call to the onActionHandled callback. With the exception of 3DS2 actions this callback is always passed the original action object.
