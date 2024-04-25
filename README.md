[![npm](https://img.shields.io/npm/v/@adyen/adyen-web.svg)](https://www.npmjs.com/package/@adyen/adyen-web)

![Web](https://user-images.githubusercontent.com/7724351/198588741-f522c3ed-ff3c-4f70-b8cb-8ff9e6d41cfa.png)

# Adyen Web

Adyen Web provides you with the building blocks to create a checkout experience for your shoppers, allowing them to pay using the payment method of their choice.

You can integrate with Adyen Web in two ways:
* [Web Drop-in](https://docs.adyen.com/online-payments/web-drop-in/): an all-in-one solution, the quickest way to accept payments on your website.
* [Web Components](https://docs.adyen.com/online-payments/web-components): one Component per payment method and combine with your own payments form logic.

## Prerequisites

* [Adyen test account](https://www.adyen.com/signup)
* [API key](https://docs.adyen.com/development-resources/how-to-get-the-api-key)
* [Client key](https://docs.adyen.com/development-resources/client-side-authentication#get-your-client-key)

## Installation

We only provide full support when you use one of these methods of installation.

### Node package manager

1. Install the [Adyen Web Node package](https://www.npmjs.com/package/@adyen/adyen-web):

  ```sh
  npm install @adyen/adyen-web --save
  ```

2. Import Adyen Web into your application:

  ```js
  import AdyenCheckout from '@adyen/adyen-web';
  import '@adyen/adyen-web/dist/adyen.css';
  ```

### Using a <script> tag

You can also import Adyen Web using a `<script>` tag, as shown in the [Web Components integration guide](https://docs.adyen.com/checkout/components-web#step-2-add-components).

## Development

Requirements:
- Node v18.18.0
- Yarn

To run the development environment:

1. Clone [this repository](https://github.com/Adyen/adyen-web).
2. Create a `.env` file on your project's root folder following the example in [`env.default`](env.default) and fill in the environment variables.
3. Install the dependencies by running:
  ```sh
  yarn install
  ```
4. If you are running the project by the first time, run the build script
  ```sh
  yarn build
  ```
5. Run the development environment, which starts a server listening on [http://localhost:3020](http://localhost:3020):
  ```sh
  yarn start
  ```

## Localization

We include UI localizations for many languages. You can check the languages and their respective translations [here](/packages/server/translations/). Furthermore, it is possible to customize the current translation [replacing the default text with your own text](https://docs.adyen.com/online-payments/build-your-integration/?platform=Web&integration=Components&version=5.60.0#customize-localization) in case you want that.  

## Styling
Adyen Web is themeable and uses CSS variables that can be overridden in order to achieve the desired style.

### Overriding styles example
For elements that are not inside iframes, you can customize the styles by overriding the styles in a css file.

1. Create `override.css` with the variables that you would like to style

   ```css
   :root {
     --adyen-checkout-input-wrapper-focus-border-color: #ff8888;
   }
   ```

2. Make sure to import the `override.css` after importing library's main CSS

   ```js
   import '@adyen/adyen-web/styles/adyen.css';
   import './override.css';
   ```
   
#### Available CSS variables

```css
:root {
    /* Fonts */
    --adyen-checkout-font-size-large: 1.5em;
    --adyen-checkout-font-size-medium: 1em;
    --adyen-checkout-font-size-small: 0.81em;
    --adyen-checkout-font-size-xsmall: 0.75em;
    --adyen-checkout-font-size-xxsmall: 0.68em;
    --adyen-checkout-line-height-600: #{$line-height-600};
    --adyen-checkout-line-height-400: #{$line-height-400};
    --adyen-checkout-line-height-200: #{$line-height-200};
    --adyen-checkout-line-height-100: #{$line-height-100};
    --adyen-checkout-font-weight-200: #{$font-weight-200};
    --adyen-checkout-font-weight-500: #{$font-weight-500};
    --adyen-checkout-font-weight-600: #{$font-weight-600};
    --adyen-checkout-font-weight-700: #{$font-weight-700};
    --adyen-checkout-text-title-font-weight: #{$text-title-font-weight};
    --adyen-checkout-text-body-font-size: #{$text-body-font-size};
    --adyen-checkout-text-body-font-weight: #{$text-body-font-weight};
    --adyen-checkout-text-body-stronger-font-weight: #{$text-body-stronger-font-weight};
    --adyen-checkout-text-body-strongest-font-weight: #{$text-body-strongest-font-weight};
    --adyen-checkout-text-title-line-height: var(--adyen-checkout-line-height-600);
    --adyen-checkout-text-caption-line-height: var(--adyen-checkout-line-height-100);
    --adyen-checkout-text-subtitle-line-height: var(--adyen-checkout-line-height-400);
    --adyen-checkout-text-subtitle-font-size: var(--adyen-checkout-font-size-medium);
    --adyen-checkout-text-subtitle-font-weight: var(--adyen-checkout-font-weight-500);
    --adyen-checkout-text-subtitle-stronger-font-weight: var(--adyen-checkout-font-weight-600);

    /* Spacing */
    --adyen-checkout-spacer-090: #{$spacer-090};
    --adyen-checkout-spacer-080: #{$spacer-080};
    --adyen-checkout-spacer-070: #{$spacer-070};
    --adyen-checkout-spacer-060: #{$spacer-060};
    --adyen-checkout-spacer-050: #{$spacer-050};
    --adyen-checkout-spacer-040: #{$spacer-040};
    --adyen-checkout-spacer-030: #{$spacer-030};
    --adyen-checkout-spacer-020: #{$spacer-020};
    --adyen-checkout-spacer-010: #{$spacer-010};
    --adyen-checkout-spacer-000: #{$spacer-000};
    --adyen-checkout-spacer-140: #{$spacer-140};
    --adyen-checkout-spacer-130: #{$spacer-130};
    --adyen-checkout-spacer-120: #{$spacer-120};
    --adyen-checkout-spacer-110: #{$spacer-110};
    --adyen-checkout-spacer-100: #{$spacer-100};

    /* Borders */
    --adyen-checkout-border-width-l: #{$border-width-l};
    --adyen-checkout-border-width-m: #{$border-width-m};
    --adyen-checkout-border-width-s: #{$border-width-s};
    --adyen-checkout-border-radius-xl: #{$border-radius-xl};
    --adyen-checkout-border-radius-l: #{$border-radius-l};
    --adyen-checkout-border-radius-m: #{$border-radius-m};
    --adyen-checkout-border-radius-s: #{$border-radius-s};
    --adyen-checkout-border-radius-xs: #{$border-radius-xs};

    /* Colors */
    --adyen-checkout-color-focus: #{$color-focus};
    --adyen-checkout-color-black: #{$color-black};
    --adyen-checkout-color-white: #{$color-white};
    --adyen-checkout-color-red: #{$color-red-1700};
    --adyen-checkout-color-grey-3200: #{$color-grey-3200};
    --adyen-checkout-color-grey-1900: #{$color-grey-1900};
    --adyen-checkout-color-grey-1300: #{$color-grey-1300};
    --adyen-checkout-color-grey-600: #{$color-grey-600};
    --adyen-checkout-color-grey-400: #{$color-grey-400};
    --adyen-checkout-color-grey-200: #{$color-grey-200};
    --adyen-checkout-color-grey-100: #{$color-grey-100};
    --adyen-checkout-color-green: #{$color-green-1700};
    --adyen-checkout-color-blue: #{$color-blue-1700};
    --adyen-checkout-color-separator-primary: var(--adyen-checkout-color-grey-200);
    --adyen-checkout-color-outline-active: var(--adyen-checkout-color-grey-3200);
    --adyen-checkout-color-outline-tertiary: var(--adyen-checkout-color-grey-1300);
    --adyen-checkout-color-outline-secondary: var(--adyen-checkout-color-grey-600);
    --adyen-checkout-color-outline-primary: var(--adyen-checkout-color-grey-400);
    --adyen-checkout-color-on-interactive-disabled: var(--adyen-checkout-color-grey-1300);
    --adyen-checkout-color-interactive-disabled: var(--adyen-checkout-color-grey-200);
    --adyen-checkout-color-interactive-readonly: var(--adyen-checkout-color-grey-1900);
    --adyen-checkout-color-interactive-primary-pressed: var(--adyen-checkout-color-grey-1300);
    --adyen-checkout-color-interactive-primary-hovered: var(--adyen-checkout-color-grey-1900);
    --adyen-checkout-color-label-success: var(--adyen-checkout-color-green);
    --adyen-checkout-color-label-critical: var(--adyen-checkout-color-red);
    --adyen-checkout-color-label-primary: var(--adyen-checkout-color-grey-3200);
    --adyen-checkout-color-label-secondary: var(--adyen-checkout-color-grey-1900);
    --adyen-checkout-color-label-tertiary: var(--adyen-checkout-color-grey-1300);
    --adyen-checkout-color-surface-modal: var(--adyen-checkout-color-white);
    --adyen-checkout-color-surface-inverse: var(--adyen-checkout-color-grey-3200);
    --adyen-checkout-color-surface-primary: var(--adyen-checkout-color-white);
    --adyen-checkout-color-background-always-dark: var(--adyen-checkout-color-grey-3200);
    --adyen-checkout-color-background-primary: var(--adyen-checkout-color-white);
    --adyen-checkout-color-background-secondary: var(--adyen-checkout-color-grey-100);
    --adyen-checkout-color-background-tertiary: var(--adyen-checkout-color-grey-200);

    /* Focus ring */
    --adyen-checkout-focus-ring-color: var(--adyen-checkout-color-focus);

    /* Drop-in */
    --adyen-checkout-dropin-payment-list-gap: var(--adyen-checkout-spacer-100);
    --adyen-checkout-dropin-payment-item-gap: var(--adyen-checkout-spacer-070);
    --adyen-checkout-dropin-payment-item-border-color: var(--adyen-checkout-color-separator-primary);
    --adyen-checkout-dropin-payment-item-border-radius: var(--adyen-checkout-border-radius-m);
    --adyen-checkout-dropin-payment-item-border-width: var(--adyen-checkout-border-width-s);
    --adyen-checkout-dropin-selected-item-background: var(--adyen-checkout-color-grey-100);
    --adyen-checkout-dropin-selected-item-border-color: var(--adyen-checkout-color-outline-active);
    --adyen-checkout-dropin-hover-item-border-color: var(--adyen-checkout-color-outline-secondary);
    --adyen-checkout-dropin-list-label-color: var(--adyen-checkout-color-label-primary);

    /* Spinner */
    --adyen-checkout-loading-indicator-color: var(--adyen-checkout-color-surface-inverse);
    --adyen-checkout-loading-indicator-background-color: var(--adyen-checkout-color-surface-inverse);

    /* Input */
    --adyen-checkout-input-field-input-color: var(--adyen-checkout-color-label-primary);
    --adyen-checkout-input-wrapper-background: var(--adyen-checkout-color-background-primary);
    --adyen-checkout-input-wrapper-inactive-background: var(--adyen-checkout-color-interactive-disabled);
    --adyen-checkout-input-wrapper-border-color: var(--adyen-checkout-color-outline-primary);
    --adyen-checkout-input-wrapper-border-radius: var(--adyen-checkout-border-radius-m);
    --adyen-checkout-input-wrapper-border-width: var(--adyen-checkout-border-width-s);
    --adyen-checkout-input-wrapper-focus-border-color: var(--adyen-checkout-color-outline-active);
    --adyen-checkout-input-wrapper-hover-border-color: var(--adyen-checkout-color-outline-tertiary);
    --adyen-checkout-input-field-height: var(--adyen-checkout-spacer-110);
    --adyen-checkout-input-field-label-color: var(--adyen-checkout-color-label-primary);
    --adyen-checkout-input-field-context-color: var(--adyen-checkout-color-label-primary);
    --adyen-checkout-input-field-label-margin-bottom: var(--adyen-checkout-spacer-020);
    --adyen-checkout-input-field-context-margin-top: var(--adyen-checkout-spacer-020);

    /* Link */
    --adyen-checkout-link-text-color: var(--adyen-checkout-color-blue);
    --adyen-checkout-link-text-decoration: underline;
    --adyen-checkout-link-border-radius: var(--adyen-checkout-border-radius-xs);

    /* Pay button */
    --adyen-checkout-button-background-color: var(--adyen-checkout-color-background-always-dark);
    --adyen-checkout-button-color: var(--adyen-checkout-color-surface-modal);
    --adyen-checkout-button-border-radius: var(--adyen-checkout-border-radius-m);
    --adyen-checkout-button-font-size: var(--adyen-checkout-font-size-medium);
    --adyen-checkout-button-font-weight: var(--adyen-checkout-text-body-stronger-font-weight);
    --adyen-checkout-button-height: var(--adyen-checkout-spacer-120);
}
```
### Style the secured fields

To style the secured fields such as card number, CVC, and expiry date of a card, you can follow the link [Styling card input fields](https://docs.adyen.com/payment-methods/cards/custom-card-integration/#styling).

## Analytics and data tracking
Starting [v5.16.0](https://github.com/Adyen/adyen-web/releases/tag/v5.16.0) the Drop-in and Components integrations contain analytics and tracking features that are turned on by default. Find out more about [what we track and how you can control it](https://docs.adyen.com/online-payments/analytics-and-data-tracking).

## Contributing

We merge every pull request into the `main` branch. We aim to keep `main` in good shape, which allows us to release a new version whenever we need to.

Have a look at our [contributing guidelines](https://github.com/Adyen/.github/blob/master/CONTRIBUTING.md) to find out how to raise a pull request.

## See also

- [Why we open sourced Adyen Web](https://www.adyen.com/blog/why-we-opened-sourced-our-web-framework)
- [Complete documentation for Adyen Web](https://docs.adyen.com/checkout/)
- [API Explorer](https://docs.adyen.com/api-explorer/)
- [Example integrations](https://github.com/adyen-examples)
- [Adyen Components JS Sample Code](https://github.com/Adyen/adyen-components-js-sample-code)

## Support

If you have a feature request, or spotted a bug or a technical problem, [create an issue here](https://github.com/Adyen/adyen-web/issues/new/choose).

For other questions, [contact our support team](https://www.adyen.help/hc/en-us/requests/new).

## License

This repository is available under the [MIT license](LICENSE).
