# @adyen/adyen-web

## 6.3.0

### Minor Changes

-   Pay by Bank US now shows whitelabel branding ([#2861](https://github.com/Adyen/adyen-web/pull/2861))

### Patch Changes

-   Reporting custom Click to Pay Visa timeouts to Visa SDK ([#2869](https://github.com/Adyen/adyen-web/pull/2869))

-   Click to Pay - Fixed ENTER keypress behavior ([#2874](https://github.com/Adyen/adyen-web/pull/2874))

## 6.2.0

### Minor Changes

-   Always make call to analytics setup endpoint ([#2838](https://github.com/Adyen/adyen-web/pull/2838))

### Patch Changes

-   Fixes regression and allows Enter key to validate/submit ([#2837](https://github.com/Adyen/adyen-web/pull/2837))

-   send browserInfo in setup call ([#2847](https://github.com/Adyen/adyen-web/pull/2847))

-   Dropin: Filtering out payment method type before creating the payment method element ([#2852](https://github.com/Adyen/adyen-web/pull/2852))

-   Fixing adyen.css file exposure for Webpack 4 projects ([#2855](https://github.com/Adyen/adyen-web/pull/2855))

-   Change ApplePaySession type to optional in window interface ([#2836](https://github.com/Adyen/adyen-web/pull/2836))

-   Fixing reliability Sonarcloud issues related to ApplePayService ([#2846](https://github.com/Adyen/adyen-web/pull/2846))

## 6.1.1

### Patch Changes

-   Fixes Lithuanian postal code to support 4-5 digits and LT prefix ([#2822](https://github.com/Adyen/adyen-web/pull/2822))

-   Improves acessibility removing region on payment method item and button loading state ([#2816](https://github.com/Adyen/adyen-web/pull/2816))

## 6.1.0

### Minor Changes

-   Display ANCV ID while displaying used payment methods on Dropin ([#2808](https://github.com/Adyen/adyen-web/pull/2808))

### Patch Changes

-   Adding missing currency information for Iceland and Bulgaria ([#2811](https://github.com/Adyen/adyen-web/pull/2811))

-   Send certain analytic config data for the `Dropin`. Modify some analytic config data for the `Card`. ([#2794](https://github.com/Adyen/adyen-web/pull/2794))

-   Fixes `props.holderName` not being used in stored cards as `paymetMethod.holderName`. ([#2813](https://github.com/Adyen/adyen-web/pull/2813))

## 6.0.3

### Patch Changes

-   adds privacy link to Riverty ([#2785](https://github.com/Adyen/adyen-web/pull/2785))

## 6.0.2

### Patch Changes

-   Fix TS error for UPI `formatProps` ([#2775](https://github.com/Adyen/adyen-web/pull/2775))

## 6.0.1

### Patch Changes

-   PayPal - Fixed bug where payment wasnt being finalized once the PayPal lightbox closes ([#2771](https://github.com/Adyen/adyen-web/pull/2771))

## 6.0.0

## Breaking Changes

### General

-   Drop-in/Components is no longer supported on Internet Explorer 11.
-   If you integrate with npm, we've changed how you import Drop-in/Components to reduce the bundle size.
-   If you integrate with embedded scripts, we changed how we expose the AdyenCheckout and Drop-in/Components on the window object.
-   We've changed how you create an instance of Drop-in or Component.
-   For the `onSubmit()` event handler, you now need to resolve/reject an actions object to continue or halt the payment flow.
-   For the `onAdditionalDetails()` event handler, you now need to resolve/reject an actions object to continue or halt the payment flow.
-   The `onPaymentCompleted()` event is no longer triggered for failed payments, instead the `onPaymentFailed()` event is triggered.
-   The `showPayButton` parameter now defaults to true.
-   The `onValid()` event is removed.
-   The `setStatusAutomatically` prop is no longer supported. If a payment is successful or if it fails, the component is kept in loading state and merchant must handle it accordingly.
-   We've changed how you style Drop-in/Components to give you more fine-grained control by using custom CSS properties. Update your CSS styles accordingly.
-   The `countryCode` property is now mandatory. It must be set directly in the `AdyenCheckout` configuration object, or in the /sessions request.
-   The `showFormInstruction` property is no longer supported.
-   When instantiating `AdyenCheckout`, you can no longer set the configuration property `installmentOptions`. It must be set in the Card Component configuration instead.
-   You can no longer set the configuration property `paymentMethodsConfiguration` when initializing `AdyenCheckout. Instead, set it in the Drop-in configuration.
-   TypeScript types are now imported directly from the root of the package, for example: `import type { CardConfiguration } from '@adyen/adyen-web';`

### Payment method specific

#### Express payment methods

-   For Google Pay express, the event handler `onPaymentDataChanged()` now works only when the Component configuration property `isExpress` is set to true.
-   For Apple Pay express, the event handlers `onShippingContactSelected()` and `onShippingMethodSelected()` now work only when the Component configuration property `isExpress` is set to true.
-   For Paypal Express, the `onShippingChange()` event handler is no longer supported. Migrate to the `onShippingAddressChange()` and `onShippingOptionsChange()` event handlers.
-   The `onShopperDetails()` event for PayPal is renamed to `onAuthorized()` and it must be resolved or rejected to finalize the payment.
-   For Google Pay, the `isAvailable()` method does not return a boolean flag anymore. Instead, the promise is resolved when the payment is available and rejected otherwise.

#### Card payment methods

-   The Card Component configuration property `showBrandsUnderCardNumber` is no longer supported.
-   The `challengeWindowSize` configuration parameter can no longer be set inside a `threeDS2` object within `paymentMethodsConfiguration`.
-   The Custom Card Component is renamed from `securedfields` to `CustomCard` and created as: `new CustomCard()`

#### Other payment methods

-   For PayPal, the `onCancel()` event handler is no longer supported. To detect when the PayPal lightbox is closed, listen to the `onError()` event with error type `CANCEL`.
-   For Klarna, the `token` property is replaced with the `authorization_token` from the `/payments/details` request.
-   For Adyen Giving, you now need to integrate with the Giving Campaign Manager Component.
-   We no longer support the payment method QiwiWallet.

#### Partial payments

-   The `onOrderCreated()` event is renamed to `onOrderUpdated()`.

## New

-   `onPaymentMethodsRequest()` is a new event, which is triggered when a partial payment is made and the associated order isn't fully paid. Use the even handler to request payment methods for a new payment.
-   `onPaymentFailed()` is a new event, which is triggered when a payment fails. Previously, this event was part of `onPaymentCompleted()`.
-   You can now disable the final animation after a successful or failed payment in Drop-in, by setting `disableFinalAnimation` to true.
-   Shoppers can now confirm the payment by pressing the Enter key. If the payment has a validation issue, an error is displayed in the Drop-in/Components interface.
-   You can customize, or prevent, the Enter keypress behavior by implementing an `onEnterKeyPressed()` event handler on AdyenCheckout.
-   We have added support for 6 more locales: Catalan (ca-ES), Icelandic (is-IS), Bulgarian (bg-BG), Estonian (et-EE), Latvian (lv-LV) and Lithuanian (lt-lT).
-   We have added support for Apple Pay Order tracking.
-   We have added support for tree shaking when integrating through npm.

## Changed

-   `onPaymentCompleted()` now works for both Sessions and Advanced flow.
-   We have replaced input field placeholder texts with permanently visible contextual elements to enhance the accessibility and UX. You can still apply and customize placeholders.
-   For Google Pay and Apple Pay, the `onAuthorized()` event is now triggered before the `onSubmit()` event. The `onAuthorized()` event must be resolved in order to proceed with the payment flow.
-   We have improved AVS checks for GooglePay and ApplePay by adding the billing address to `state.data` if available during payment method authorization.
-   Drop-in no longer uses radio buttons by default.
-   The WeChatPay timer now defaults to 30 minutes.

## Updating to this version

This release requires Checkout API v69 or later. We recommend using the latest Checkout API version.

To update from Drop-in/Components v5.x.x, follow the migration guide.

---

## Previous Changelogs

### 5.x.x

See [5.x.x changelog](https://github.com/Adyen/adyen-web/blob/v5/packages/lib/CHANGELOG.md)
