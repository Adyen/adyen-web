# Adyen Web

With Adyen Web you can help your shoppers pay with a payment method of their choice. It provides you with the building blocks you need to create a checkout experience.

You can integrate with Adyen in two ways, Drop-in and Components.

* [Getting Started](https://docs.adyen.com/checkout/)
* [Drop-in Documentation](https://docs.adyen.com/checkout/drop-in-web/)
* [Components Documentation](https://docs.adyen.com/checkout/components-web/)

## Installation

### NPM

Install [NPM](https://www.npmjs.com/package/@adyen/adyen-web) package:

```sh
npm install @adyen/adyen-web --save
```

And import in your application:

```js
import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
```

### Script tag

Adyen Web can also be imported with a `<script>` tag, refer to [the documentation](https://docs.adyen.com/checkout/components-web#step-2-add-components) for instructions.

## See also

-   [Complete Documentation](https://docs.adyen.com/checkout/)

-   [API Explorer](https://docs.adyen.com/api-explorer/)

-   [Adyen Components JS Sample Code](https://github.com/Adyen/adyen-components-js-sample-code)


## Development environment

Follow these steps to run our development playground:

* Clone [this repository](https://github.com/Adyen/adyen-web) and navigate to the root of the project.
* Create a `.env` file on your project's root folder following the example on `.env.default` and fill in the necessary environment variables.
* Install all dependencies by running:
```
yarn install
```

* Start the development playground. This will start a local server on [http://localhost:3020](http://localhost:3020).
```
yarn start
```

### Branch organization

We merge every pull request to the `master` branch. We aim to keep `master` in good shape, which allows us to release a new version whenever we need to.

## Support

If you have a feature request, or spotted a bug or a technical problem, create an issue here. For other questions, contact our [support team](https://support.adyen.com/hc/en-us/requests/new?ticket_form_id=360000705420).

## License

This repository is open source and available under the MIT license. For more information, see the LICENSE file.

[apiexplorer.paymentmethods]: https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v49/paymentMethods
[apiexplorer.payments]: https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v49/payments
[apiexplorer.paymentsdetails]: https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v49/paymentsDetails
