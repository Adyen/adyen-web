---
'@adyen/adyen-web': patch
---

Fixed: Riverty (AfterPay) consent link falls back to the English payment conditions of the country when the shopper locale has no translated document, instead of rendering a link that cannot be opened.
