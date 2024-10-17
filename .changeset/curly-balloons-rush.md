---
'@adyen/adyen-web': patch
---

Calling actions.reject() in the beforeSubmit callback should leave the UI in the current state. Fixes situation where it leads to a call to handleFailedResult which ultimately leads to a call to the onPaymentFailed callback and sets the UI to an error state
