# @adyen/adyen-web

## 6.23.0

### Minor Changes

- Analytics - Adding events when loading third party script SDKs ([#3512](https://github.com/Adyen/adyen-web/pull/3512))

- Fastlane - Added analytics to the shopper recognition flow ([#3464](https://github.com/Adyen/adyen-web/pull/3464))

- Apple Pay - Adding 'domainName' configuration property which can be used to set which domain is performing the merchant validation request (Useful when embedding component within iframe) ([#3561](https://github.com/Adyen/adyen-web/pull/3561))

- Add support for bankTransfer in new countries ([#3543](https://github.com/Adyen/adyen-web/pull/3543))

-   - Update UI to display Pix code ([#3542](https://github.com/Adyen/adyen-web/pull/3542))

    - Adjusted legal text for Fastlane

-   - Update QR code UI for PIX payment to switch between displaying QR code and copying code text ([#3509](https://github.com/Adyen/adyen-web/pull/3509))

    - Display full bank code for PIX so users can also highlight and copy the code directly

-   - Improve responsiveness of Segmented controller component and fix font size ([#3544](https://github.com/Adyen/adyen-web/pull/3544))

    - Improve paypal button unit tests

- Allow leading zeros for payto phone number input ([#3529](https://github.com/Adyen/adyen-web/pull/3529))

- Use v6 SecuredFields: which bumps the JWE version, drops the ACH bundle, and disallows the "compat" version on Live ([#3461](https://github.com/Adyen/adyen-web/pull/3461))

### Patch Changes

- Adding retrial mechanism for third party script load ([#3500](https://github.com/Adyen/adyen-web/pull/3500))

- Fix accessibility issue with opening klarna widget with enter button ([#3560](https://github.com/Adyen/adyen-web/pull/3560))

- GooglePay - Parsing brands from Backoffice if available ([#3539](https://github.com/Adyen/adyen-web/pull/3539))

- Fix checkmark style for UPI app selector ([#3533](https://github.com/Adyen/adyen-web/pull/3533))

## 6.22.0

### Minor Changes

- Adjust the existing UPI component to support UPI Autopay. ([#3465](https://github.com/Adyen/adyen-web/pull/3465))

### Patch Changes

- Analytics - Patching attempt ID when page refreshes ([#3491](https://github.com/Adyen/adyen-web/pull/3491))

- fix: OnAddressSelectedType typing ([#3499](https://github.com/Adyen/adyen-web/pull/3499))

- fix: focus bug when having multiple IssuerLists inside dropin ([#3498](https://github.com/Adyen/adyen-web/pull/3498))

- Fix PayTo aria-controls poiting to wrong IDs ([#3475](https://github.com/Adyen/adyen-web/pull/3475))

## 6.21.0

### Minor Changes

- PIX Open Finance UX improvements. ([#3446](https://github.com/Adyen/adyen-web/pull/3446))

### Patch Changes

- Stop preselecting a card brand in dual branding scenarios outside of Europe. This will allow us to continue doing low cost routing outside of Europe ([#3447](https://github.com/Adyen/adyen-web/pull/3447))

- Fixed alignment and font size for the Pay button's secondary amount label. ([#3451](https://github.com/Adyen/adyen-web/pull/3451))

- ACH - Adding config to pre-fill 'Account holder name' field ([#3434](https://github.com/Adyen/adyen-web/pull/3434))

## 6.20.0

### Minor Changes

- Improved the user experience for the UPI component: ([#3420](https://github.com/Adyen/adyen-web/pull/3420))
    - **On mobile devices,** the QR code flow has been removed. Shoppers will be guided to pay with their installed UPI apps (Intent flow) or by entering their UPI ID.
    - **On desktop devices,** the QR code flow is now the default, with the option to pay via UPI ID also available.
    - Added a validation alert to guide shoppers to select a UPI app before proceeding with the payment.
    - Updated instructional labels for better clarity across all payment modes.

### Patch Changes

- Click to Pay: treat cards with Status Active and Pending as non expired. ([#3392](https://github.com/Adyen/adyen-web/pull/3392))

- adds onAddressSelected callback type to CardConfiguration ([#3379](https://github.com/Adyen/adyen-web/pull/3379))

- Updated icelandic storeDetails translation ([#3432](https://github.com/Adyen/adyen-web/pull/3432))

- Fixed a styling issue where the installments dropdown was missing its border and background color. ([#3425](https://github.com/Adyen/adyen-web/pull/3425))

- fix: add billing address and shopper details to PaymentData interface ([#3431](https://github.com/Adyen/adyen-web/pull/3431))

## 6.19.0

### Minor Changes

- UI improvements for the `BankTransfer` UI element. ([#3359](https://github.com/Adyen/adyen-web/pull/3359))

### Patch Changes

- Change how Dropin story selects a storedCard, and how we set the alt attr on a storedCard image, after changes to the API response. ([#3395](https://github.com/Adyen/adyen-web/pull/3395))

- ACH - Component pay button now displays "Pay {value}" instead of "Continue purchase" ([#3390](https://github.com/Adyen/adyen-web/pull/3390))

## 6.18.1

### Patch Changes

- Only show the new dual brand switching UI if the /binLookup response contains certain brands. ([#3388](https://github.com/Adyen/adyen-web/pull/3388))

## 6.18.0

### Minor Changes

- a11y: improve giftcard screen reader errors ([#3356](https://github.com/Adyen/adyen-web/pull/3356))

- Add support for the following Bank Transfer tx variants: ([#3343](https://github.com/Adyen/adyen-web/pull/3343))
    - bankTransfer_BE
    - bankTransfer_NL
    - bankTransfer_PL
    - bankTransfer_FR
    - bankTransfer_CH
    - bankTransfer_IE
    - bankTransfer_GB
    - bankTransfer_DE

### Patch Changes

- Fastlane - Exposing utility function on UMD bundle ([#3361](https://github.com/Adyen/adyen-web/pull/3361))

## 6.17.0

### Minor Changes

- Export `Core` class. ([#3342](https://github.com/Adyen/adyen-web/pull/3342))

- New PreAuthorizationDebitCanada component ([#3341](https://github.com/Adyen/adyen-web/pull/3341))

## 6.16.0

### Minor Changes

- UPI - Updated label 'Enter UPI ID' to 'UPI ID' ([#3348](https://github.com/Adyen/adyen-web/pull/3348))

- A new UI for switching between dual brands to comply with new guidelines from the schemes ([#3336](https://github.com/Adyen/adyen-web/pull/3336))

### Patch Changes

- A11y: Remove radiogroup on dropin when rending a single payment method ([#3338](https://github.com/Adyen/adyen-web/pull/3338))

- CSS and markup tweaks to new dual branding UI (relates to #3336) ([#3346](https://github.com/Adyen/adyen-web/pull/3346))

## 6.15.0

### Minor Changes

- Added `paybybank_pix` component. ([#3252](https://github.com/Adyen/adyen-web/pull/3252))

- Making the creation of analytics events more declarative ([#3300](https://github.com/Adyen/adyen-web/pull/3300))

- Card: Pay button now loads at the same time as other UI elements ([#3298](https://github.com/Adyen/adyen-web/pull/3298))

## 6.14.0

### Minor Changes

- Riverty - Updated component to be a Redirect component ([#3299](https://github.com/Adyen/adyen-web/pull/3299))

- Added `filterStoredPaymentMethods` callback to the Drop-in. This callback lets you choose which saved payment methods appear in the Drop-in. ([#3183](https://github.com/Adyen/adyen-web/pull/3183))

## 6.13.1

### Patch Changes

- Fixed issue where clipboard copy-paste functionality wasn't working for mobile Safari 18.4 browsers ([#3314](https://github.com/Adyen/adyen-web/pull/3314))

## 6.13.0

### Minor Changes

- [Apple Pay] Add support for shippingContactEditingMode configuration value ([#3289](https://github.com/Adyen/adyen-web/pull/3289))

    This configuration value is used to prevent a user from editing the shipping address. This is useful for store pickup checkout options.

    https://developer.apple.com/documentation/applepayontheweb/applepaypaymentrequest/shippingcontacteditingmode

- Added support for Fastlane payment method ([#3076](https://github.com/Adyen/adyen-web/pull/3076))

### Patch Changes

- GooglePay - isValid flag adjusted to always be true ([#3297](https://github.com/Adyen/adyen-web/pull/3297))

## 6.12.1

### Patch Changes

- Fixed issue where card inputs weren't respecting background color styles if the merchant set a meta tag to describe the color scheme ([#3281](https://github.com/Adyen/adyen-web/pull/3281))

- Upped SF version to fix issue with LastPass & autofilling ([#3279](https://github.com/Adyen/adyen-web/pull/3279))

## 6.12.0

### Minor Changes

- ACH - Added Drop-down to select Account Type and input field to verify the Account Number ([#3241](https://github.com/Adyen/adyen-web/pull/3241))

### Patch Changes

- Add missing callback types to customCard ([#3212](https://github.com/Adyen/adyen-web/pull/3212))

- BrowserInfo no longer calls obsolete `navigator.javaEnabled` function ([#3234](https://github.com/Adyen/adyen-web/pull/3234))

- Apple Pay - Added missing Typescript types for the ApplePayButtonType ([#3218](https://github.com/Adyen/adyen-web/pull/3218))

- Google Pay - Fixed issue where Google Pay standalone component wasn't recognizing 'paywithgoogle' payment method ([#3253](https://github.com/Adyen/adyen-web/pull/3253))

## 6.11.0

### Minor Changes

- Allow typing to continue in cardNumber field after panLength result from binLookup ([#3198](https://github.com/Adyen/adyen-web/pull/3198))

### Patch Changes

- Apple Pay - Fixed issue where its iframe detection code crashes server side rendered apps ([#3204](https://github.com/Adyen/adyen-web/pull/3204))

- Card - Fixed issue where clicking on the input field icons were not causing the respective input field to be focused ([#3197](https://github.com/Adyen/adyen-web/pull/3197))

## 6.10.0

### Minor Changes

- ApplePay - Adding support for third-party browsers ([#3130](https://github.com/Adyen/adyen-web/pull/3130))

### Patch Changes

- GooglePay - Fixed challengeWindowSize property when using Google Pay as Instant payment type inside Drop-in ([#3170](https://github.com/Adyen/adyen-web/pull/3170))

- update error message for single branded card ([#3177](https://github.com/Adyen/adyen-web/pull/3177))

- Translations - Fixed brazilian social security number translation (CPF/CNPJ) for different languages ([#3172](https://github.com/Adyen/adyen-web/pull/3172))

- A11y improvements: contrast, aria-expands and svg alt text ([#3188](https://github.com/Adyen/adyen-web/pull/3188))

- Google Pay - Throwing error in case the merchant id is missing ([#3179](https://github.com/Adyen/adyen-web/pull/3179))

- Typescript - Fixed issue where exposed types for GooglePay/ApplePay were not being found ([#3178](https://github.com/Adyen/adyen-web/pull/3178))

## 6.9.0

### Minor Changes

- Feature: New PayTo payment method ([#3114](https://github.com/Adyen/adyen-web/pull/3114))

### Patch Changes

- GooglePay - Fixed issue where calling reject on onClick event was triggering an unhandled exception ([#3151](https://github.com/Adyen/adyen-web/pull/3151))

- Move `@adyen/bento-design-tokens` into devDependencies. ([#3124](https://github.com/Adyen/adyen-web/pull/3124))

- GooglePay - Added 'challengeWindowSize' typescript type to its interface ([#3120](https://github.com/Adyen/adyen-web/pull/3120))

- Fixes giftcard component unresponsive when requiring confirmation ([#3119](https://github.com/Adyen/adyen-web/pull/3119))

- Use built-in mechanism to disable OpenInvoice (and ACH) components when Pay pressed ([#3142](https://github.com/Adyen/adyen-web/pull/3142))

- Boleto - Added missing properties to its typescript interface ([#3121](https://github.com/Adyen/adyen-web/pull/3121))

- Added missing type (onAutoComplete) in CustomCardConfiguration ([#3144](https://github.com/Adyen/adyen-web/pull/3144))

- Adds stored component logic to PayTo ([#3156](https://github.com/Adyen/adyen-web/pull/3156))

## 6.8.0

### Minor Changes

- Use `rem` for the font size unit, and fixed some style issues due to the font scaling. ([#3067](https://github.com/Adyen/adyen-web/pull/3067))

### Patch Changes

- Set `options` in ICore:createFromAction to be optional ([#3053](https://github.com/Adyen/adyen-web/pull/3053))

- Update securedFields version to 5.5.0 (supports font size set in rem) ([#3091](https://github.com/Adyen/adyen-web/pull/3091))

## 6.7.0

### Minor Changes

- Start tracking API errors for the following endpoints for analytics purposes: ([#3035](https://github.com/Adyen/adyen-web/pull/3035))
    - `/sessions/${session.id}/payments`
    - `/sessions/${session.id}/orders`
    - `/sessions/${session.id}/paymentDetails`
    - `v1/submitThreeDS2Fingerprint`

### Patch Changes

- Resolve the issue where `GooglePayButton` fails to pass `buttonRadius` to the `createButton` function when the value is 0. ([#3039](https://github.com/Adyen/adyen-web/pull/3039))

- Klarna - Fix issue where Klarna as standalone component didn't initialize the Klarna Widget SDK accordingly ([#3064](https://github.com/Adyen/adyen-web/pull/3064))

- Internal improvement to avoid unnecessary second call of sanitizeResponse during the payment response handling process ([#3015](https://github.com/Adyen/adyen-web/pull/3015))

- Fixes Click to Pay link looking buttons into proper buttons ([#3029](https://github.com/Adyen/adyen-web/pull/3029))

- Fix the styles for the remove stored card confirmation to ensure responsiveness on smaller devices. ([#3037](https://github.com/Adyen/adyen-web/pull/3037))

- Improve types for CustomCard ([#3068](https://github.com/Adyen/adyen-web/pull/3068))

- Adding missing Trustly translations ([#3055](https://github.com/Adyen/adyen-web/pull/3055))

## 6.6.0

### Minor Changes

- Updated DonationComponent UI ([#2980](https://github.com/Adyen/adyen-web/pull/2980))

- Feat: enable logos for SK and CZ online banking ([#2939](https://github.com/Adyen/adyen-web/pull/2939))

### Patch Changes

- A new barcode endpoint has been created on the backend. This PR generates barCode URLs against that endpoint. ([#2936](https://github.com/Adyen/adyen-web/pull/2936))

- Fix bug where Country field and State field where not showing the correct required attribute. ([#2944](https://github.com/Adyen/adyen-web/pull/2944))

- Send redirection error events to analytics. ([#2973](https://github.com/Adyen/adyen-web/pull/2973))

- Add fix to reshow card icon if previously it had failed to load ([#2955](https://github.com/Adyen/adyen-web/pull/2955))

- Send `level` field to the analytic `setup` call. If analytics is `enabled`, we send `level` value `all`, otherwise we send `initial`. ([#2933](https://github.com/Adyen/adyen-web/pull/2933))

- Klarna - Fixed issue where PayLater/PayOverTime payments were not authorized accordingly depending on how the shopper interacted with the Drop-in/Component ([#3007](https://github.com/Adyen/adyen-web/pull/3007))

- Change WeChat Pay QR countdown translation. ([#3006](https://github.com/Adyen/adyen-web/pull/3006))

- Hide the default ACH holder name contextual text. ([#3008](https://github.com/Adyen/adyen-web/pull/3008))

## 6.5.1

### Patch Changes

- Fixed issue where onBlur validation didn't fire if year in expiryDate was just one digit ([#2945](https://github.com/Adyen/adyen-web/pull/2945))

## 6.5.0

### Minor Changes

- PayMe - Improved instructions UI ([#2910](https://github.com/Adyen/adyen-web/pull/2910))

- PayNow - Adding instructions to scan QR code on mobile view ([#2910](https://github.com/Adyen/adyen-web/pull/2910))

### Patch Changes

- Fix issue where 'auto' bundle was tree-shaken by bundlers in prod builds ([#2914](https://github.com/Adyen/adyen-web/pull/2914))

- Fix address lookup reseting state field after country change ([#2927](https://github.com/Adyen/adyen-web/pull/2927))

- Revert Icelandic Krona to be treated as a currency with minor units, in order to align with our documentation ([#2924](https://github.com/Adyen/adyen-web/pull/2924))

- Fix `UPIComponent` initial value for `isValid`. It should only be default to `true` for UPI QR. ([#2921](https://github.com/Adyen/adyen-web/pull/2921))

- Lowered ECMAScript version to 2020 in order to support older iOS versions ([#2917](https://github.com/Adyen/adyen-web/pull/2917))

- Payconic - Adjusted QR code message and removed unused button label. ([#2910](https://github.com/Adyen/adyen-web/pull/2910))

## 6.4.0

### Minor Changes

- All actions lead to a call to the onActionHandled callback. With the exception of 3DS2 actions this callback is always passed the original action object. ([#2892](https://github.com/Adyen/adyen-web/pull/2892))

- Adds selector for savings and checking accounts on ACH component ([#2898](https://github.com/Adyen/adyen-web/pull/2898))

- Export CustomTranslations type ([#2905](https://github.com/Adyen/adyen-web/pull/2905))

### Patch Changes

- Calling actions.reject() in the beforeSubmit callback should leave the UI in the current state. Fixes situation where it leads to a call to handleFailedResult which ultimately leads to a call to the onPaymentFailed callback and sets the UI to an error state ([#2901](https://github.com/Adyen/adyen-web/pull/2901))

- Small optimisation to only call document.querySelector once, rather than three times ([#2895](https://github.com/Adyen/adyen-web/pull/2895))

- Added optional chaining operator to postMessage handler function. Fixes issue where 'get-process-message.handler.js' caused exceptions due to stray postMessages without properly formed events ([#2894](https://github.com/Adyen/adyen-web/pull/2894))

## 6.3.0

### Minor Changes

- Pay by Bank US now shows whitelabel branding ([#2861](https://github.com/Adyen/adyen-web/pull/2861))

### Patch Changes

- Reporting custom Click to Pay Visa timeouts to Visa SDK ([#2869](https://github.com/Adyen/adyen-web/pull/2869))

- Click to Pay - Fixed ENTER keypress behavior ([#2874](https://github.com/Adyen/adyen-web/pull/2874))

## 6.2.0

### Minor Changes

- Always make call to analytics setup endpoint ([#2838](https://github.com/Adyen/adyen-web/pull/2838))

### Patch Changes

- Fixes regression and allows Enter key to validate/submit ([#2837](https://github.com/Adyen/adyen-web/pull/2837))

- send browserInfo in setup call ([#2847](https://github.com/Adyen/adyen-web/pull/2847))

- Dropin: Filtering out payment method type before creating the payment method element ([#2852](https://github.com/Adyen/adyen-web/pull/2852))

- Fixing adyen.css file exposure for Webpack 4 projects ([#2855](https://github.com/Adyen/adyen-web/pull/2855))

- Change ApplePaySession type to optional in window interface ([#2836](https://github.com/Adyen/adyen-web/pull/2836))

- Fixing reliability Sonarcloud issues related to ApplePayService ([#2846](https://github.com/Adyen/adyen-web/pull/2846))

## 6.1.1

### Patch Changes

- Fixes Lithuanian postal code to support 4-5 digits and LT prefix ([#2822](https://github.com/Adyen/adyen-web/pull/2822))

- Improves acessibility removing region on payment method item and button loading state ([#2816](https://github.com/Adyen/adyen-web/pull/2816))

## 6.1.0

### Minor Changes

- Display ANCV ID while displaying used payment methods on Dropin ([#2808](https://github.com/Adyen/adyen-web/pull/2808))

### Patch Changes

- Adding missing currency information for Iceland and Bulgaria ([#2811](https://github.com/Adyen/adyen-web/pull/2811))

- Send certain analytic config data for the `Dropin`. Modify some analytic config data for the `Card`. ([#2794](https://github.com/Adyen/adyen-web/pull/2794))

- Fixes `props.holderName` not being used in stored cards as `paymetMethod.holderName`. ([#2813](https://github.com/Adyen/adyen-web/pull/2813))

## 6.0.3

### Patch Changes

- adds privacy link to Riverty ([#2785](https://github.com/Adyen/adyen-web/pull/2785))

## 6.0.2

### Patch Changes

- Fix TS error for UPI `formatProps` ([#2775](https://github.com/Adyen/adyen-web/pull/2775))

## 6.0.1

### Patch Changes

- PayPal - Fixed bug where payment wasnt being finalized once the PayPal lightbox closes ([#2771](https://github.com/Adyen/adyen-web/pull/2771))

## 6.0.0

## Breaking Changes

### General

- Drop-in/Components is no longer supported on Internet Explorer 11.
- If you integrate with npm, we've changed how you import Drop-in/Components to reduce the bundle size.
- If you integrate with embedded scripts, we changed how we expose the AdyenCheckout and Drop-in/Components on the window object.
- We've changed how you create an instance of Drop-in or Component.
- For the `onSubmit()` event handler, you now need to resolve/reject an actions object to continue or halt the payment flow.
- For the `onAdditionalDetails()` event handler, you now need to resolve/reject an actions object to continue or halt the payment flow.
- The `onPaymentCompleted()` event is no longer triggered for failed payments, instead the `onPaymentFailed()` event is triggered.
- The `showPayButton` parameter now defaults to true.
- The `onValid()` event is removed.
- The `setStatusAutomatically` prop is no longer supported. If a payment is successful or if it fails, the component is kept in loading state and merchant must handle it accordingly.
- We've changed how you style Drop-in/Components to give you more fine-grained control by using custom CSS properties. Update your CSS styles accordingly.
- The `countryCode` property is now mandatory. It must be set directly in the `AdyenCheckout` configuration object, or in the /sessions request.
- The `showFormInstruction` property is no longer supported.
- When instantiating `AdyenCheckout`, you can no longer set the configuration property `installmentOptions`. It must be set in the Card Component configuration instead.
- You can no longer set the configuration property `paymentMethodsConfiguration` when initializing `AdyenCheckout. Instead, set it in the Drop-in configuration.
- TypeScript types are now imported directly from the root of the package, for example: `import type { CardConfiguration } from '@adyen/adyen-web';`

### Payment method specific

#### Express payment methods

- For Google Pay express, the event handler `onPaymentDataChanged()` now works only when the Component configuration property `isExpress` is set to true.
- For Apple Pay express, the event handlers `onShippingContactSelected()` and `onShippingMethodSelected()` now work only when the Component configuration property `isExpress` is set to true.
- For Paypal Express, the `onShippingChange()` event handler is no longer supported. Migrate to the `onShippingAddressChange()` and `onShippingOptionsChange()` event handlers.
- The `onShopperDetails()` event for PayPal is renamed to `onAuthorized()` and it must be resolved or rejected to finalize the payment.
- For Google Pay, the `isAvailable()` method does not return a boolean flag anymore. Instead, the promise is resolved when the payment is available and rejected otherwise.

#### Card payment methods

- The Card Component configuration property `showBrandsUnderCardNumber` is no longer supported.
- The `challengeWindowSize` configuration parameter can no longer be set inside a `threeDS2` object within `paymentMethodsConfiguration`.
- The Custom Card Component is renamed from `securedfields` to `CustomCard` and created as: `new CustomCard()`

#### Other payment methods

- For PayPal, the `onCancel()` event handler is no longer supported. To detect when the PayPal lightbox is closed, listen to the `onError()` event with error type `CANCEL`.
- For Klarna, the `token` property is replaced with the `authorization_token` from the `/payments/details` request.
- For Adyen Giving, you now need to integrate with the Giving Campaign Manager Component.
- We no longer support the payment method QiwiWallet.

#### Partial payments

- The `onOrderCreated()` event is renamed to `onOrderUpdated()`.

## New

- `onPaymentMethodsRequest()` is a new event, which is triggered when a partial payment is made and the associated order isn't fully paid. Use the even handler to request payment methods for a new payment.
- `onPaymentFailed()` is a new event, which is triggered when a payment fails. Previously, this event was part of `onPaymentCompleted()`.
- You can now disable the final animation after a successful or failed payment in Drop-in, by setting `disableFinalAnimation` to true.
- Shoppers can now confirm the payment by pressing the Enter key. If the payment has a validation issue, an error is displayed in the Drop-in/Components interface.
- You can customize, or prevent, the Enter keypress behavior by implementing an `onEnterKeyPressed()` event handler on AdyenCheckout.
- We have added support for 6 more locales: Catalan (ca-ES), Icelandic (is-IS), Bulgarian (bg-BG), Estonian (et-EE), Latvian (lv-LV) and Lithuanian (lt-lT).
- We have added support for Apple Pay Order tracking.
- We have added support for tree shaking when integrating through npm.

## Changed

- `onPaymentCompleted()` now works for both Sessions and Advanced flow.
- We have replaced input field placeholder texts with permanently visible contextual elements to enhance the accessibility and UX. You can still apply and customize placeholders.
- For Google Pay and Apple Pay, the `onAuthorized()` event is now triggered before the `onSubmit()` event. The `onAuthorized()` event must be resolved in order to proceed with the payment flow.
- We have improved AVS checks for GooglePay and ApplePay by adding the billing address to `state.data` if available during payment method authorization.
- Drop-in no longer uses radio buttons by default.
- The WeChatPay timer now defaults to 30 minutes.

## Updating to this version

This release requires Checkout API v69 or later. We recommend using the latest Checkout API version.

To update from Drop-in/Components v5.x.x, follow the [migration guide](https://docs.adyen.com/online-payments/upgrade-your-integration/migrate-to-web-v6/).

---

## Previous Changelogs

### 5.x.x

See [5.x.x changelog](https://github.com/Adyen/adyen-web/blob/v5/packages/lib/CHANGELOG.md)
