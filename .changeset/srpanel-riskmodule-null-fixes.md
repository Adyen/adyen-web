---
'@adyen/adyen-web': patch
---

Fixed: Setting `risk.onComplete`, `risk.onError` or `srConfig.node` to `undefined`, or rendering the countdown outside an SRPanel provider, no longer throws.
