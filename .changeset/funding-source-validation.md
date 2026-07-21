---
'@adyen/adyen-web': minor
---

Added: Support for `allowedFundingSources` in the scheme's `configuration` object in the /paymentMethods response. When this comma-separated string (e.g. `"debit,prepaid"`) is present and non-empty, the Card component strictly validates that the entered card's funding source (resolved by the internal BIN lookup) is included in the allowed list, rejecting cards whose funding source is not allowed. Validation is skipped when `allowedFundingSources` is absent/empty or when the BIN lookup resolves no funding source. Also added a nullable per-brand `fundingSource` field to the BIN lookup brand type.
