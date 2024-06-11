# @adyen/adyen-web

## 5.66.1

### Patch Changes

-   For sessions /setup call, we are passing the full error object instead of hardcoded 'ERROR: Invalid ClientKey' message ([#2706](https://github.com/Adyen/adyen-web/pull/2706))

## 5.66.0

### Minor Changes

-   Add upi intent flow to the UPI component. The upi intent flow is shown only on the mobile device if the upi intent app list is provided. ([#2673](https://github.com/Adyen/adyen-web/pull/2673))

    If the app list is not provided, we show the default `vpa` mode.
    The drop-in component shows only one upi component if the parent `upi` tx_variant is found.

### Patch Changes

-   Fix: ACH not respecting showPayButton ([#2696](https://github.com/Adyen/adyen-web/pull/2696))

-   Click to Pay - Fixed bug where newly created card was taking priority of used cards in the Card list view, and improved CSS specificity for the Card image size when displaying single Card ([#2694](https://github.com/Adyen/adyen-web/pull/2694))

## 5.65.0

### Minor Changes

-   iDeal is now treated as a Redirect rather than an IssuerList PM ([#2689](https://github.com/Adyen/adyen-web/pull/2689))

-   Adding subType to 3DS2 analytics events ([#2680](https://github.com/Adyen/adyen-web/pull/2680))

### Patch Changes

-   GooglePay adds origin to state.data ([#2690](https://github.com/Adyen/adyen-web/pull/2690))

## 5.64.0

### Minor Changes

-   Checkout analytics can be passed a checkoutAttemptId ([#2654](https://github.com/Adyen/adyen-web/pull/2654))

-   Pass config to allow SF to expose expiryDate ([#2651](https://github.com/Adyen/adyen-web/pull/2651))

### Patch Changes

-   fix: ANCV ignoring exesting order & payButton not working as intended ([#2655](https://github.com/Adyen/adyen-web/pull/2655))

-   Don't log threeDSCompInd or transStatus from 3DS2 process ([#2666](https://github.com/Adyen/adyen-web/pull/2666))

-   Fix for the OpenInvoice uncaught error when checking and unchecking terms and conditions. This change also fixed the issue that payment goes through without accepting terms and conditions. ([#2660](https://github.com/Adyen/adyen-web/pull/2660))

## 5.63.0

### Minor Changes

-   Remove the country flag in the Phone select, change the label to `Country/Region` for the country/region field. ([#2628](https://github.com/Adyen/adyen-web/pull/2628))

### Patch Changes

-   fix: vouchers (econtext and dragonpay) can now show expiration date with time ([#2618](https://github.com/Adyen/adyen-web/pull/2618))

-   Refactor how wallet PMs call submitAnalytics when they are used as express PMs ([#2617](https://github.com/Adyen/adyen-web/pull/2617))

-   Fix the bug that the drop-in is not rendered when there are only instant payments. ([#2629](https://github.com/Adyen/adyen-web/pull/2629))

## 5.62.0

### Minor Changes

-   Using securedFields v4.8.3 to handle 19 digit Diners ([#2625](https://github.com/Adyen/adyen-web/pull/2625))

## 5.61.0

### Minor Changes

-   Allow forward slashes in address fields ([#2607](https://github.com/Adyen/adyen-web/pull/2607))

### Patch Changes

-   Fixing SRPanel issues in OpenInvoice comp now that (delivery) addresses can have first & last Names ([#2604](https://github.com/Adyen/adyen-web/pull/2604))

-   Fix(a11y): select/combobox aria-activedescendant is now empty when active item is null ([#2612](https://github.com/Adyen/adyen-web/pull/2612))

-   Add analytics to ascertain when certain "wallets" are explicitly used as express payment methods ([#2616](https://github.com/Adyen/adyen-web/pull/2616))

## 5.60.0

### Minor Changes

-   Add support for new Donation properties. ([#2572](https://github.com/Adyen/adyen-web/pull/2572))

-   Starting using /checkoutanalytics endpoint to retrieve "checkoutAttemptId" log "submit" and "action-handled" events ([#2234](https://github.com/Adyen/adyen-web/pull/2234))

### Patch Changes

-   Sanitize `billingAddress` when making a `/payments` call. Remove `firstName` and `lastName` in the `billingAddress` for non Riverty payments. ([#2591](https://github.com/Adyen/adyen-web/pull/2591))

-   For regular card, zero auth payments, we store the payment method only if the configuration says we should ([#2589](https://github.com/Adyen/adyen-web/pull/2589))

-   Updating applepay typescript types and fixing challengeWindowSize prop ([#2584](https://github.com/Adyen/adyen-web/pull/2584))

## 5.59.0

### Minor Changes

-   Adding support for PayPal Express Flow ([#2551](https://github.com/Adyen/adyen-web/pull/2551))

### Patch Changes

-   For zero auth payments, we always send the `storePaymentMethod` to save the payment details. ([#2571](https://github.com/Adyen/adyen-web/pull/2571))

## 5.58.0

### Minor Changes

-   Add the support for new Riverty component. It will replace the old AfterPay component in the future, currently only supports AT, CH and DE countries. ([#2532](https://github.com/Adyen/adyen-web/pull/2532))

-   Adds new Paytrail component (EBanking_FI) ([#2528](https://github.com/Adyen/adyen-web/pull/2528))

### Patch Changes

-   Fix missing bindings for 'this' that had started causing errors in iOS ([#2557](https://github.com/Adyen/adyen-web/pull/2557))

## 5.57.0

### Minor Changes

-   Use the label provided by the backend in stored blik payments ([#2522](https://github.com/Adyen/adyen-web/pull/2522))

## 5.56.1

### Patch Changes

-   For the regular card payment, in case of a zero-auth transaction, the pay button label is changed to `Save details`, and the `Save for my next payment` checkbox is removed. ([#2514](https://github.com/Adyen/adyen-web/pull/2514))

    The drop-in component shows `Details saved` as the success message for such transaction.

## 5.56.0

### Minor Changes

-   Add support for the PayMe payment method. ([#2476](https://github.com/Adyen/adyen-web/pull/2476))

### Patch Changes

-   Improve the payment status check call for QR payments. ([#2506](https://github.com/Adyen/adyen-web/pull/2506))

-   Fix incorrect grammar German pay button ([#2505](https://github.com/Adyen/adyen-web/pull/2505))

-   update sessionData after /setup call ([#2504](https://github.com/Adyen/adyen-web/pull/2504))

-   Detect when the value of a data-cse attribute is not supported, and don't create a SF for it ([#2495](https://github.com/Adyen/adyen-web/pull/2495))

## 5.55.1

### Patch Changes

-   Loading the logo images properly when handling qrCode/await actions ([#2490](https://github.com/Adyen/adyen-web/pull/2490))

## 5.55.0

### Minor Changes

-   Bumping sf version to 4.8.0 which includes a more comprehensive startup log (to help with debugging) ([#2488](https://github.com/Adyen/adyen-web/pull/2488))

### Patch Changes

-   Renaming detectInIframe to the more accurate, but lengthy, detectInIframeInSameOrigin. ([#2475](https://github.com/Adyen/adyen-web/pull/2475))

    Now the functionality only considers itself to be running in an iframe _if_ it is possible to access the parent domain and thus be able to redirect the top, parent, window

## 5.54.0

### Minor Changes

-   feature: adds new onAddressSelected to fill data when an item is selected in AddressSearch ([#2406](https://github.com/Adyen/adyen-web/pull/2406))

-   Click to Pay - Enabling MC/Visa to drop cookies if the shopper gives consent ([#2409](https://github.com/Adyen/adyen-web/pull/2409))

-   Click to Pay - Replacing loading gif by animated SVGs ([#2435](https://github.com/Adyen/adyen-web/pull/2435))

### Patch Changes

-   For all PaymentMethodItems we were adding a class `adyen-checkout__payment-method--{fundingSource}` (where fundingSource was either "credit" or "debit") ([#2465](https://github.com/Adyen/adyen-web/pull/2465))

    This is meant to be a Card PM specific class to indicate, in the paymentMethods list, whether the card is a credit or debit card.

-   Fixed Klarna B2B logo for Drop-in ([#2458](https://github.com/Adyen/adyen-web/pull/2458))

-   Pass the `browserInfo` in the `state.data` for the Redirect payments, in order to fix the mobile web integration for some redirect payments. ([#2469](https://github.com/Adyen/adyen-web/pull/2469))

## 5.53.3

### Patch Changes

-   Correct the T&C links for Riverty, remove the B2B T&C link, and change the text from 'AfterPay' to 'Riverty'. ([#2422](https://github.com/Adyen/adyen-web/pull/2422))

## 5.53.2

### Patch Changes

-   chore: fix ts config ([#2313](https://github.com/Adyen/adyen-web/pull/2313))

-   UX improvement for the `QRLoader` component - the QR loader shows amount and redirect button before the QR code image. ([#2359](https://github.com/Adyen/adyen-web/pull/2359))

## 5.53.1

### Patch Changes

-   Typescript: Fixed types for paymentMethodsConfiguration object ([#2363](https://github.com/Adyen/adyen-web/pull/2363))

## 5.53.0

### Minor Changes

-   Add `klarna_b2b` tx variant so that Billie (klarna_b2b) is supported. ([#2355](https://github.com/Adyen/adyen-web/pull/2355))

### Patch Changes

-   Fixes an issue with CtPOneTimePassword getting updates to the input element reference it relies upon ([#2353](https://github.com/Adyen/adyen-web/pull/2353))

-   Improvements: add `authorization_token` in the Klarna widget AdditionalDetails state data, so that we are aligned with the API specs. ([#2358](https://github.com/Adyen/adyen-web/pull/2358))

-   Fix Typescript definition for paymentMethodsConfiguration, allowing usage of Tx variants that are not defined in the codebase ([#2349](https://github.com/Adyen/adyen-web/pull/2349))

-   Populate data with initial values (empty strings) for 'ibanNumber' and 'ownerName' ([#2354](https://github.com/Adyen/adyen-web/pull/2354))

## 5.52.0

### Minor Changes

-   adds support for ANCV payment method ([#2293](https://github.com/Adyen/adyen-web/pull/2293))

### Patch Changes

-   fix: remove inline style applied to iframe ([#2343](https://github.com/Adyen/adyen-web/pull/2343))

-   fix: Clear timeouts on SecuredFieldsProvider when unmounting the component ([#2334](https://github.com/Adyen/adyen-web/pull/2334))

-   fix(personalDetails): classNameModifiers for dateOfBirth ([#2344](https://github.com/Adyen/adyen-web/pull/2344))

## 5.51.0

### Minor Changes

-   Add 'redirectFromTopWhenInIframe' config prop to allow top level redirect when Checkout loaded in an iframe ([#2325](https://github.com/Adyen/adyen-web/pull/2325))

## 5.50.1

### Patch Changes

-   Perform extra checks that a valid value has been passed when a dual branding selection is made ([#2321](https://github.com/Adyen/adyen-web/pull/2321))

## 5.50.0

### Minor Changes

-   Bancontact now returns paymentMethod.type 'bcmc' instead of 'scheme' ([#2286](https://github.com/Adyen/adyen-web/pull/2286))

-   Added environmentUrls parameter to Core, which allows PBL to use custom URLs for the API and assets ([#2262](https://github.com/Adyen/adyen-web/pull/2262))

### Patch Changes

-   For some storedCards it is not allowed to store the expiryDate, so when this info is not present in the storedCardData, we hide the readonly expiryDate field ([#2315](https://github.com/Adyen/adyen-web/pull/2315))

## 5.49.6

### Patch Changes

-   fixes bug where storedetails had state value of true by default without visually showing it ([#2307](https://github.com/Adyen/adyen-web/pull/2307))

## 5.49.5

### Patch Changes

-   Fixes postalCode having maxlength 0 ([#2305](https://github.com/Adyen/adyen-web/pull/2305))

## 5.49.4

### Patch Changes

-   Fixed e2e tests that were failing due to recent changes in how alt attributes are assigned ([#2289](https://github.com/Adyen/adyen-web/pull/2289))

-   Handling Safari's Responsive Design Mode to prevent undesired behaviour revolving around our "disable arrow keys on the iOS soft keyboard" feature ([#2299](https://github.com/Adyen/adyen-web/pull/2299))

-   Send 'do-not-track' as value for checkoutAttemptId when analytics is disabled ([#2290](https://github.com/Adyen/adyen-web/pull/2290))

-   Removes internal function renderFormField, improving typescript for all form fields ([#2298](https://github.com/Adyen/adyen-web/pull/2298))

-   Fixed bug where initial value for cvcPolicy &/or expiryDatePolicy could be overwritten if multiple card components on the same page ([#2297](https://github.com/Adyen/adyen-web/pull/2297))

## 5.49.3

### Patch Changes

-   fixes missing ResultCode typings ([#2287](https://github.com/Adyen/adyen-web/pull/2287))

-   fix issuer list logos not loading from resources url ([#2278](https://github.com/Adyen/adyen-web/pull/2278))

## 5.49.2

### Patch Changes

-   Add description for Trustly. ([#2276](https://github.com/Adyen/adyen-web/pull/2276))

## 5.49.1

### Patch Changes

-   fixes invalid HTML in payment method item and card labels ([#2270](https://github.com/Adyen/adyen-web/pull/2270))

## 5.49.0

### Minor Changes

-   Adding timeout mechanism for Click to Pay to display Card component in case it does not initialize within 5 seconds ([#2265](https://github.com/Adyen/adyen-web/pull/2265))

### Patch Changes

-   Fix Core `update` should also update payment methods list. ([#2266](https://github.com/Adyen/adyen-web/pull/2266))

-   fixes aria-labelledby in paymentMethodItem ([#2261](https://github.com/Adyen/adyen-web/pull/2261))

-   Fix Klarna widget blocks drop-in to be clickable on loaded. ([#2258](https://github.com/Adyen/adyen-web/pull/2258))

## 5.48.0

### Minor Changes

-   Securefields label now is decorative div element ([#2256](https://github.com/Adyen/adyen-web/pull/2256))

-   Stop implicitly associating labels with the elements they label ([#2243](https://github.com/Adyen/adyen-web/pull/2243))

### Patch Changes

-   Refactor the SRPanel type definition ([#2217](https://github.com/Adyen/adyen-web/pull/2217))

-   Alt tags for card brands now use readable values ([#2256](https://github.com/Adyen/adyen-web/pull/2256))

-   Autofocus on the QR code subtitle on mounted. ([#2246](https://github.com/Adyen/adyen-web/pull/2246))

## 5.47.0

### Minor Changes

-   A11y improvements: add form instruction to better assist cognitively impaired shoppers. ([#2241](https://github.com/Adyen/adyen-web/pull/2241))

    By default, we always show the instruction on top of the payment form, this can be turned off by setting `showFormInstruction=false`.

## 5.46.1

### Patch Changes

-   Reverted `threeDSServerTransID` check on challenge completion ([#2231](https://github.com/Adyen/adyen-web/pull/2231)) ([#2238](https://github.com/Adyen/adyen-web/pull/2238))

-   Adjusted amount and currency values in the telemetry event ([#2219](https://github.com/Adyen/adyen-web/pull/2219))

-   Adds new translations strings ([#2239](https://github.com/Adyen/adyen-web/pull/2239))

-   Report to sr panel on payment status for the drop-in and QR code ([#2236](https://github.com/Adyen/adyen-web/pull/2236))

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
