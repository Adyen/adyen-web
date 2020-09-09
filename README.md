# Adyen Web

[![npm](https://img.shields.io/npm/v/@adyen/adyen-web.svg)](http://npm.im/@adyen/adyen-web)

Adyen Web provides you with the building blocks to create a checkout experience for your shoppers, allowing them to pay using the payment method of their choice.

You can integrate with Adyen Web in two ways:
* [Web Drop-in](https://docs.adyen.com/checkout/drop-in-web/): an all-in-one solution, the quickest way to accept payments on your website.
* [Web Components](https://docs.adyen.com/checkout/components-web/): one Component per payment method and combine with your own payments form logic.

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

To run the development environment:

1. Clone [this repository](https://github.com/Adyen/adyen-web).
2. Create a `.env` file on your project's root folder following the example in [`env.default`](env.default) and fill in the environment variables.
3. Install the dependencies by running:
  ```sh
  yarn install
  ```
4. Run the development environment, which starts a server listening on [http://localhost:3020](http://localhost:3020):
  ```sh
  yarn start
  ```

## Contributing

We merge every pull request into the `master` branch. We aim to keep `master` in good shape, which allows us to release a new version whenever we need to.

Have a look at our [contributing guidelines](https://github.com/Adyen/.github/blob/master/CONTRIBUTING.md) to find out how to raise a pull request.

## See also

- [Why we open sourced Adyen Web](https://www.adyen.com/blog/why-we-opened-sourced-our-web-framework)
- [Complete documentation for Adyen Web](https://docs.adyen.com/checkout/)
- [API Explorer](https://docs.adyen.com/api-explorer/)
- [Example integrations](https://github.com/adyen-examples)
- [Adyen Components JS Sample Code](https://github.com/Adyen/adyen-components-js-sample-code)

## Support

If you have a feature request, or spotted a bug or a technical problem, [create an issue here](https://github.com/Adyen/adyen-web/issues/new/choose).

For other questions, [contact our support team](https://support.adyen.com/hc/en-us/requests/new?ticket_form_id=360000705420).

## License

This repository is available under the [MIT license](LICENSE).
