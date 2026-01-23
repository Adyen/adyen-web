---
'@adyen/adyen-web': patch
---

Fixed: Detect when the containing element for a component that relies on securedFields, is not in the DOM. This means the iframe can never configure since, in order for the window.postMessage to be sent, the iframe has to be in the DOM
