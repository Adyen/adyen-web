import AdyenCheckout from '~';
import '../../config/polyfills';
import '../style.scss';
import { getPaymentMethods, getOriginKey } from '../services';
import { handleChange, handleSubmit, handleAdditionalDetails } from '../events';
import { amount, shopperLocale } from '../config/commonConfig';

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
            //            environment: 'http://localhost:8080/checkoutshopper/',
            //                        environment: 'https://checkoutshopper-beta.adyen.com/checkoutshopper/',
            environment: 'test',
            onChange: handleChange,
            onSubmit: handleSubmit,
            onAdditionalDetails: handleAdditionalDetails,
            onError: console.error,
            showPayButton: true
            // risk: {
            //     node: '.merchant-checkout__form',
            //     onComplete: riskData => {
            //         console.log('handleOnRiskData riskData=', riskData);
            //     },
            //     onError: console.error,
            //     enabled: true
            // }
        });

        // AmazonPay
        window.amazonpay = checkout
            .create('amazonpay', {
                currency: 'EUR',
                environment: 'test',
                locale: 'en-GB',
                merchantId: 'A3SKIS53IXYBBU',
                placement: 'Product',
                productType: 'PayOnly',
                region: 'EU',
                publicKeyId: 'AFLWXJCSP5OEOU7NPOYGMGG7',

                /**
                 * The component will send both the returnUrl (as checkoutReviewReturnUrl) and the storeId to the /getAmazonSignature endpoint from Adyen,
                 * which will create and return the signature.
                 * (steps 2 and 3 from "Signing requests | AmazonPay": https://amazon-pay-acquirer-guide.s3-eu-west-1.amazonaws.com/v2/amazon-pay-api-v2/signing-requests.html)
                 */
                returnUrl: 'http://localhost:3020/components',
                storeId: 'abc'
            })
            .mount('.amazonpay-field');

        window.amazonpayorder = checkout
            .create('amazonpay', {
                /**
                 * The merchant will receive the checkoutSessionId from the /getAmazonCheckoutSession endpoint from Adyen.
                 * They need to then pass it to the component.
                 */
                checkoutSessionId: 'abc',

                /**
                 * To be used as checkoutResultReturnUrl
                 */
                returnUrl: 'http://localhost:3020/components', // to be used as checkoutReviewReturnUrl

                /**
                 * A payments request is done with the checkoutSessionId.
                 * The Checkout API will use checkoutSessionId to get the amazonPayToken and complete the payment.
                 */
                onSubmit: handleSubmit
            })
            .mount('.amazonpayorder-field');

        // Adyen Giving
        window.donation = checkout
            .create('donation', {
                onDonate: (state, component) => console.log({ state, component }),
                url: 'https://example.org',
                amounts: {
                    currency: 'EUR',
                    values: [300, 500, 1000]
                },
                backgroundUrl:
                    'https://www.patagonia.com/static/on/demandware.static/-/Library-Sites-PatagoniaShared/default/dwb396273f/content-banners/100-planet-hero-desktop.jpg',
                description: 'Lorem ipsum...',
                logoUrl: 'https://i.ebayimg.com/images/g/aTwAAOSwfu9dfX4u/s-l300.jpg',
                name: 'Test Charity'
            })
            .mount('.donation-field');

        const ariaLabels = {
            lang: 'en-GB',
            encryptedBankAccountNumber: {
                label: 'Custom aria bank accnt label',
                iframeTitle: 'Iframe for bank accnt number',
                error: 'Ongeldig kaartnummer'
            }
        };

        // MBWay
        window.mbway = checkout.create('mbway').mount('.mbway-field');

        // ACH
        window.ach = checkout
            .create('ach', {
                //                holderNameRequired: false,
                //                hasHolderName: false,
                ariaLabels,
                onConfigSuccess: obj => {
                    console.log('### Components::onConfigSuccess:: obj', obj);
                },
                //                billingAddressRequired: false,
                //                billingAddressAllowedCountries: ['US', 'PR'],
                data: {
                    //                    holderName: 'B. Fish',
                    billingAddress: {
                        street: 'Infinite Loop',
                        postalCode: '95014',
                        city: 'Cupertino',
                        houseNumberOrName: '1',
                        country: 'US',
                        stateOrProvince: 'CA'
                    }
                }
            })
            .mount('.ach-field');

        // SEPA Direct Debit
        window.sepa = checkout
            .create('sepadirectdebit', {
                countryCode: 'NL',
                holderName: true
            })
            .mount('.sepa-field');

        // Qiwi
        window.qiwi = checkout.create('qiwiwallet', {}).mount('.qiwi-field');

        // SEPA Direct Debit
        window.vipps = checkout.create('vipps').mount('.vipps-field');

        // PAYPAL
        window.paypalButtons = checkout
            .create('paypal', {
                // merchantId: '5RZKQX2FC48EA',
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

        // PAYPAL
        window.blik = checkout.create('blik', {}).mount('.blik-field');

        // GOOGLE PAY
        const googlepay = checkout.create('paywithgoogle', {
            // environment: 'PRODUCTION',
            environment: 'TEST',

            // Callbacks
            onAuthorized: console.info,
            // onError: console.error,

            // Payment info
            currencyCode: 'EUR',
            amount: 10, // 0.1 EUR (minor units)

            // Merchant config (required)
            configuration: {
                gatewayMerchantId: 'TestMerchant', // name of MerchantAccount
                merchantName: 'Adyen Test merchant', // Name to be displayed
                merchantIdentifier: '06946223745213860250' // Required in Production environment. Google's merchantId: https://developers.google.com/pay/api/web/guides/test-and-deploy/deploy-production-environment#obtain-your-merchantID
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

        window.applepay = applepay;

        // Giropay
        window.giropay = checkout.create('giropay').mount('.giropay-field');

        // Redirect
        // window.redirect = checkout.create('paypal').mount('.redirect-field');
    });
