---
'@adyen/adyen-web': patch
---

Fixed: Setting `risk.onComplete` or `risk.onError` to `undefined` no longer throws; the risk module treats it like an omitted callback and still removes its container.
