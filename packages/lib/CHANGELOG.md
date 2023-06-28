# @adyen/adyen-web

## 5.46.1

### Patch Changes

-   -   Reverted `threeDSServerTransID` check on challenge completion ([#2231](https://github.com/Adyen/adyen-web/pull/2231)) ([#2238](https://github.com/Adyen/adyen-web/pull/2238))

-   Adjusted amount and currency values in the telemetry event ([#2219](https://github.com/Adyen/adyen-web/pull/2219))

-   adds new translations strings

-   -   Report to sr panel on payment status for the drop-in and QR code ([#2236](https://github.com/Adyen/adyen-web/pull/2236))

    -   Remove the duplicated sr panel which has the same id

## 5.46.0

### Minor Changes

-   Added isExpress configuration to PayPal component ([#2220](https://github.com/Adyen/adyen-web/pull/2220))

## 5.45.0

### Minor Changes

-   feature: adds address lookup functionality ([#2151](https://github.com/Adyen/adyen-web/pull/2151))

### Patch Changes

-   Change meal voucher label _Pin_ to _Security code_ ([#2210](https://github.com/Adyen/adyen-web/pull/2210))

-   Better regex & error message for validation/formatting of Brazilian post codes. ([#2211](https://github.com/Adyen/adyen-web/pull/2211))

    We now allow a hyphen between the 5th & 6th digits

-   Fix inconsistency displaying custom brand logo for the gift card payment ([#2215](https://github.com/Adyen/adyen-web/pull/2215))

-   Fixes issue which ApplePay crashes Drop-in when initialized within iframe ([#2212](https://github.com/Adyen/adyen-web/pull/2212))

-   Removing tsconfig stripInternals from lib package ([#2213](https://github.com/Adyen/adyen-web/pull/2213))

## 5.44.0

### Minor Changes

-   Feeds the count-down information to the SR panel and refactor the Countdown to a functional component with A11y reporter custom hook. ([#2182](https://github.com/Adyen/adyen-web/pull/2182))

-   Adding support for the payment method Cash App Pay ([#2105](https://github.com/Adyen/adyen-web/pull/2105))

### Patch Changes

-   Prevent double readout of PM names, by a screenreader, in Dropin. ([#2206](https://github.com/Adyen/adyen-web/pull/2206))

-   Fixes for/id in the label of the select field pointing to the outer div instead of the correct combobox input ([#2205](https://github.com/Adyen/adyen-web/pull/2205))
