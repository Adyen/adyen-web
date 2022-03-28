import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { getPaymentMethods, makePayment } from '../../services';
import { handleSubmit, handleAdditionalDetails } from '../../handlers';
import { checkPaymentResult } from '../../utils';
import { amount, shopperLocale, countryCode } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

getPaymentMethods({ amount, shopperLocale, countryCode }).then(async paymentMethodsResponse => {
    window.checkout = await AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: console.error,
        showPayButton: true
    });
    // console.log('hii');
    // AMAZON PAY
    // Demo only
    const urlSearchParams = new URLSearchParams(window.location.search);
    const amazonCheckoutSessionId = urlSearchParams.get('amazonCheckoutSessionId');
    const step = urlSearchParams.get('step');

    const chargeOptions = {
        // chargePermissionType: 'Recurring',
        // recurringMetadata: {
        //     frequency: {
        //         unit: 'Month',
        //         value: '1'
        //     }
        // }
    };

    // Initial state
    if (!step) {
        window.amazonpay = checkout
            .create('amazonpay', {
                productType: 'PayOnly',
                ...chargeOptions,
                // Regular checkout:
                // returnUrl: 'http://localhost:3020/wallets?step=result',
                // checkoutMode: 'ProcessOrder'

                // Express Checkout flow:
                returnUrl: 'http://localhost:3020/wallets?step=review'
            })
            .mount('.amazonpay-field');
    }

    // Review and confirm order
    if (step === 'review') {
        window.amazonpay = checkout
            .create('amazonpay', {
                ...chargeOptions,
                /**
                 * The merchant will receive the amazonCheckoutSessionId attached in the return URL.
                 */
                amazonCheckoutSessionId,
                cancelUrl: 'http://localhost:3020/wallets',
                returnUrl: 'http://localhost:3020/wallets?step=result'
            })
            .mount('.amazonpay-field');
    }

    // Make payment
    if (step === 'result') {
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
                            if (response.action) {
                                component.handleAction(response.action);
                            } else if (response?.resultCode && checkPaymentResult(response.resultCode)) {
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
            // configuration: {
            //      merchantId: '5RZKQX2FC48EA',
            //      intent: 'capture'
            // },
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
        countryCode: 'DE', // Required. The merchant’s two-letter ISO 3166 country code.

        // Merchant config (required)
        configuration: {
            merchantName: 'Adyen Test merchant', // Name to be displayed
            merchantIdentifier: '000000000200001' // Required. https://developer.apple.com/documentation/apple_pay_on_the_web/applepayrequest/2951611-merchantidentifier
        },
        buttonType: 'buy'
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
