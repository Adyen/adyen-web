import AdyenCheckout from '../../../src';
import { getPaymentMethods, getOriginKey } from '../../services';
import { handleChange, handleSubmit, handleAdditionalDetails } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

getOriginKey()
    .then(originKey => {
        window.originKey = originKey;
    })
    .then(() => getPaymentMethods({ amount, shopperLocale }))
    .then(paymentMethodsResponse => {
        window.checkout = new AdyenCheckout({
            amount, // Optional. Used to display the amount in the Pay Button.
            originKey,
            clientKey: process.env.__CLIENT_KEY__,
            paymentMethodsResponse,
            locale: shopperLocale,
            // environment: 'http://localhost:8080/checkoutshopper/',
            // environment: 'https://checkoutshopper-beta.adyen.com/checkoutshopper/',
            environment: 'test',
            onChange: handleChange,
            onSubmit: handleSubmit,
            onAdditionalDetails: handleAdditionalDetails,
            onError: console.error,
            showPayButton: true
        });

        // PAYPAL
        window.paypalButtons = checkout
            .create('paypal', {
                // merchantId: '5RZKQX2FC48EA', // automatic ?
                // intent: 'capture', // 'capture' [Default] / 'authorize'
                // commit: true, // true [Default] / false
                // style: {},

                // Events
                onError: (error, component) => {
                    component.setStatus('ready');
                    console.log('paypal onError', error);
                },

                onCancel: (data, component) => {
                    component.setStatus('ready');
                    console.log('paypal onCancel', data);
                }
            })
            .mount('.paypal-field');

        // GOOGLE PAY
        const googlepay = checkout.create('paywithgoogle', {
            // environment: 'PRODUCTION',
            environment: 'TEST',

            // Callbacks
            onAuthorized: console.info,
            // onError: console.error,

            // Payment info
            amount: { value: 10, currency: 'EUR' }, // 0.1 EUR (minor units)
            countryCode: 'NL',

            // Merchant config (required)
            configuration: {
                gatewayMerchantId: 'TestMerchant', // name of MerchantAccount
                merchantName: 'Adyen Test merchant', // Name to be displayed
                merchantId: '06946223745213860250' // Required in Production environment. Google's merchantId: https://developers.google.com/pay/api/web/guides/test-and-deploy/deploy-production-environment#obtain-your-merchantID
            },

            // Shopper info (optional)
            emailRequired: true,
            shippingAddressRequired: true,
            shippingAddressParameters: {}, // https://developers.google.com/pay/api/web/reference/object#ShippingAddressParameters

            // Button config (optional)
            buttonType: 'long', // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
            buttonColor: 'default' // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
        });

        // First, check availability. If environment is TEST, Google Pay will always be considered available.
        googlepay
            .isAvailable()
            .then(() => {
                googlepay.mount('.googlepay-field');
            })
            .catch(e => console.warn(e));

        window.googlepay = googlepay;

        // APPLE PAY
        const applepay = checkout.create('applepay', {
            // Callbacks
            onAuthorized: console.info,
            // onError: console.error,

            // Payment info
            currencyCode: 'EUR', // Required. The three-letter ISO 4217 currency code for the payment.
            amount: 10, // 0.1 EUR (minor units)
            countryCode: 'DE', // Required. The merchant’s two-letter ISO 3166 country code.

            // Merchant config (required)
            configuration: {
                merchantName: 'Adyen Test merchant', // Name to be displayed
                merchantIdentifier: '06946223745213860250' // Required. https://developer.apple.com/documentation/apple_pay_on_the_web/applepayrequest/2951611-merchantidentifier
            },

            // Button config (optional)
            buttonType: 'long', // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
            buttonColor: 'default' // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
        });

        applepay
            .isAvailable()
            .then(isAvailable => {
                // If Available mount it in the dom
                if (isAvailable) applepay.mount('#applepay-field');
            })
            .catch(e => {
                console.warn(e);
            });
    });
