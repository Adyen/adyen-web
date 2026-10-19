---
'@adyen/adyen-web': minor
---

Improved: Upgraded to Bento design tokens v2, refreshing the default colours, corner radii and font weights, and replacing the undocumented `--adyen-sdk-toggle-*`, `--adyen-sdk-button-tertiary-*` and `--adyen-sdk-alert-*` CSS variables with core tokens. The pay button now uses `--adyen-sdk-color-background-inverse-primary`, `--adyen-sdk-color-background-inverse-primary-hover` and `--adyen-sdk-color-background-inverse-primary-active`; the previous `--adyen-sdk-color-background-always-dark` and `--adyen-sdk-color-background-always-dark-active` overrides are deprecated but still applied to the pay button as fallbacks.
