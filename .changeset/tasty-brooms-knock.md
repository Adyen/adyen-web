---
'@adyen/adyen-web': patch
---

Send `level` field to the analytic `setup` call. If analytics is `enabled`, we send `level` value `all`, otherwise we send `initial`.
