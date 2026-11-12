---
'@adyen/adyen-web': patch
---

Fixed: Setting `srConfig.node` to `undefined` no longer makes checkout initialization fail; the screen-reader panel falls back to `body` like an omitted `node`.
