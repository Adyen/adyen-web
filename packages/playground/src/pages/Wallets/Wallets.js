import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { getPaymentMethods, makePayment } from '../../services';
import { handleSubmit, handleAdditionalDetails } from '../../handlers';
import { checkPaymentResult } from '../../utils';
import { amount, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

getPaymentMethods({ amount, shopperLocale }).then(paymentMethodsResponse => {
    window.checkout = new AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        // environment: 'http://localhost:8080/checkoutshopper/',
        // environment: 'https://checkoutshopper-beta.adyen.com/checkoutshopper/',
        environment: 'test',
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: console.error,
        showPayButton: true
    });

    // AMAZON PAY
    // Demo only
    const urlSearchParams = new URLSearchParams(window.location.search);
    const amazonCheckoutSessionId = urlSearchParams.get('amazonCheckoutSessionId');
    const step = urlSearchParams.get('step');

    // Initial state
    if (!amazonCheckoutSessionId || step === 'cancel') {
        window.amazonpay = checkout
            .create('amazonpay', {
                currency: 'GBP',
                environment: 'test',
                configuration: {
                    merchantId: 'A3SKIS53IXYBBU',
                    publicKeyId: 'AG77NIXPURMDUC3DOC5WQPPH',
                    storeId: 'amzn1.application-oa2-client.4cedd73b56134e5ea57aaf487bf5c77e'
                },
                productType: 'PayOnly',
                cancelUrl: 'http://localhost:3020/wallets?step=cancel',
                returnUrl: 'http://localhost:3020/wallets?step=review'
            })
            .mount('.amazonpay-field');
    }

    // Review and confirm order
    if (amazonCheckoutSessionId && step === 'review') {
        window.amazonpay = checkout
            .create('amazonpay', {
                /**
                 * The merchant will receive the amazonCheckoutSessionId attached in the return URL.
                 */
                amazonCheckoutSessionId,
                cancelUrl: 'http://localhost:3020/wallets?step=cancel',
                returnUrl: 'http://localhost:3020/wallets?step=result',
                amount: {
                    currency: 'GBP',
                    value: 4700
                }
            })
            .mount('.amazonpay-field');
    }

    // Make payment
    if (amazonCheckoutSessionId && step === 'result') {
        window.amazonpay = checkout
            .create('amazonpay', {
                /**
                 * The merchant will receive the amazonCheckoutSessionId attached in the return URL.
                 */
                amazonCheckoutSessionId,
                showOrderButton: false,
                onSubmit: (state, component) => {
                    return makePayment(state.data)
                        .then(response => {
                            if (response?.resultCode && checkPaymentResult(response.resultCode)) {
                                alert(response.resultCode);
                            } else {
                                // Try handling the decline flow
                                // This will redirect the shopper to select another payment method
                                component.handleDeclineFlow();
                            }
                        })
                        .catch(error => {
                            throw Error(error);
                        });
                },
                onError: e => {
                    if (e.resultCode) {
                        alert(e.resultCode);
                    } else {
                        console.error(e);
                    }
                }
            })
            .mount('.amazonpay-field');

        window.amazonpay.submit();
    }

    // PAYPAL
    window.paypalButtons = checkout
        .create('paypal', {
            // merchantId: '5RZKQX2FC48EA',
            // intent: 'capture', // 'capture' [Default] / 'authorize'
            //                configuration: {
            //                    merchantId: '5RZKQX2FC48EA',
            //                    intent: 'capture'
            //                },
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
        countryCode: 'NL',

        // Merchant config (required)
        //            configuration: {
        //                gatewayMerchantId: 'TestMerchant', // name of MerchantAccount
        //                merchantName: 'Adyen Test merchant', // Name to be displayed
        //                merchantId: '06946223745213860250' // Required in Production environment. Google's merchantId: https://developers.google.com/pay/api/web/guides/test-and-deploy/deploy-production-environment#obtain-your-merchantID
        //            },

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
        onAuthorized: (resolve, reject, event) => {
            console.log('Apple Pay onAuthorized', event);
            resolve();
        },
        // onError: console.error,

        // Payment info
        currencyCode: 'EUR', // Required. The three-letter ISO 4217 currency code for the payment.
        amount: 10, // 0.1 EUR (minor units)
        countryCode: 'DE', // Required. The merchant’s two-letter ISO 3166 country code.

        // Merchant config (required)
        configuration: {
            merchantName: 'Adyen Test merchant', // Name to be displayed
            merchantIdentifier: '000000000200001' // Required. https://developer.apple.com/documentation/apple_pay_on_the_web/applepayrequest/2951611-merchantidentifier
        },

        // Button config (optional)
        buttonType: 'long', // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
        buttonColor: 'default' // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
    });

    applepay
        .isAvailable()
        .then(isAvailable => {
            // Demo only
            if (isAvailable) document.querySelector('#applepay').classList.remove('merchant-checkout__payment-method--hidden');

            // If Available mount it in the dom
            if (isAvailable) applepay.mount('.applepay-field');
        })
        .catch(e => {
            console.warn(e);
        });
});
