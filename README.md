# Adyen Web

With Adyen Web you can help your shoppers pay with a payment method of their choice. It provides you with the building blocks you need to create a checkout experience.

You can integrate with Adyen in two ways, Drop-in and Components.

> [Getting Started](https://docs.adyen.com/checkout/)

## Drop-in

Drop-in is our all-in-one UI solution that you can add on your payments form so you can start accepting transactions for key payment methods using a single front-end implementation.

The [Drop-in](https://docs.adyen.com/checkout/drop-in-web/) handles the presentation of available payment methods and the subsequent entry of a customer's payment details. It is initialized with the response of [`/paymentMethods`][apiexplorer.paymentmethods], and provides everything you need to make an API call to [`/payments`][apiexplorer.payments] and [`/payments/details`][apiexplorer.paymentsdetails].

> [Drop-in Documentation](https://docs.adyen.com/checkout/drop-in-web/)

## Components

We built separate Components per payment method that you can use to render UI for collecting your shopper's payment details.

Follow these instructions to load Components in your project:

> [Components Documentation](https://docs.adyen.com/checkout/components-web/)

> [Available Components](https://docs.adyen.com/checkout/supported-payment-methods)

## Styling

To modify the appearance of any component, overwrite the corresponding styles in CSS.
For your convenience, we use the BEM methodology for naming the HTML and CSS structures. All checkout elements are prepended with "adyen-checkout", for example: `.adyen-checkout__label`

## Localization

You are free to customize any string you see in the interface of any of the languages we support out of the box. Additionally you can also add new language sets.

> [Localizing Components](https://docs.adyen.com/checkout/components-web/localization-components/)

## See also

-   [Complete Documentation](https://docs.adyen.com/checkout/)

-   [API Explorer](https://docs.adyen.com/api-explorer/)

-   [Adyen Components JS Sample Code](https://github.com/Adyen/adyen-components-js-sample-code)


## Development environment

Follow these steps to run our development playground:

* Clone [this repository](https://github.com/Adyen/adyen-web) and navigate to the root of the project.
* Create a `.env` file on your project's root folder following the example on `.env.default` and fill in the necessary environment variables.
* Install all dependencies by running either `npm install` or `yarn install`.
* Start the development playground by running `npm start` or `yarn start`. This will start a local server on [http://localhost:3020](http://localhost:3020).

## Branch organization

We merge every pull request to the `master` branch. We aim to keep `master` in good shape, which allows us to release a new version whenever we need to.

## Support

If you have any problems, questions or suggestions, create an issue here or send your inquiry to support@adyen.com.


## License

This repository is open source and available under the MIT license. For more information, see the LICENSE file.

[apiexplorer.paymentmethods]: https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v49/paymentMethods
[apiexplorer.payments]: https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v49/payments
[apiexplorer.paymentsdetails]: https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v49/paymentsDetails
