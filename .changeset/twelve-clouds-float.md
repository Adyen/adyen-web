---
'@adyen/adyen-web': patch
---

Renaming detectInIframe to the more accurate, but lengthy, detectInIframeInAccessibleDomain.
Now the functionality only considers itself to be running in an iframe _if_ it is possible to access the parent domain and thus be able to redirect the top, parent, window
