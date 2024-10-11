---
'@adyen/adyen-web': patch
---

Added optional chaining operator to postMessage handler function. Fixes issue where 'get-process-message.handler.js' caused exceptions due to stray postMessages without properly formed events

