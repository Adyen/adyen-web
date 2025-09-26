import { AdyenCheckout, CashAppPay, ClickToPay, AmazonPay, PayPal, GooglePay, ApplePay } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';

import { getPaymentMethods, makePayment } from '../../services';
import { handleSubmit, handleAdditionalDetails } from '../../handlers';
import { checkPaymentResult } from '../../utils';
import { amount, shopperLocale, countryCode, environmentUrlsOverride } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
    window.checkout = await AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        ...environmentUrlsOverride,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onPaymentCompleted: (result, element) => {
            console.log('onPaymentCompleted', result, element);
        },
        onPaymentFailed: (result, element) => {
            alert(`onPaymentFailed - ${result.resultCode}`);
            console.log('onPaymentFailed', result, element);
        },
        onError(error) {
            console.log(error);
        },
        showPayButton: true,
        analytics: {
            analyticsData: {
                applicationInfo: {
                    merchantApplication: {
                        name: 'merchant_application_name',
                        version: 'version'
                    },
                    externalPlatform: {
                        name: 'external_platform_name',
                        version: 'external_platform_version',
                        integrator: 'getSystemIntegratorName'
                    }
                }
            }
        }
    });

    // Cash App Pay
    window.cashApp = new CashAppPay(window.checkout, {
        onClick(actions) {
            console.log('CashAppApp: onClick');
            actions.resolve();
        }
    }).mount('.cashapp-field');

    // CLICK TO PAY
    window.clickToPay = new ClickToPay(window.checkout, {
        shopperEmail: 'gui.ctp@adyen.com',
        onReady() {
            console.log('ClickToPay is ready');
        },
        onTimeout(error) {
            console.log(error);
        }
    });
    window.clickToPay
        .isAvailable()
        .then(() => {
            document.querySelector('#clicktopay').classList.remove('merchant-checkout__payment-method--hidden');
            window.clickToPay.mount('.clicktopay-field');
        })
        .catch(e => {
            console.warn('ClickToPay is NOT available');
        });

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
        window.amazonpay = new AmazonPay(window.checkout, {
            productType: 'PayOnly',
            ...chargeOptions,
            // Regular checkout:
            // returnUrl: 'http://localhost:3020/wallets?step=result',
            // checkoutMode: 'ProcessOrder'

            // Express Checkout flow:
            returnUrl: 'http://localhost:3020/wallets?step=review'
        }).mount('.amazonpay-field');
    }

    // Review and confirm order
    if (step === 'review') {
        window.amazonpay = new AmazonPay(window.checkout, {
            ...chargeOptions,
            /**
             * The merchant will receive the amazonCheckoutSessionId attached in the return URL.
             */
            amazonCheckoutSessionId,
            cancelUrl: 'http://localhost:3020/wallets',
            returnUrl: 'http://localhost:3020/wallets?step=result'
        }).mount('.amazonpay-field');
    }

    // Make payment
    if (step === 'result') {
        window.amazonpay = new AmazonPay(window.checkout, {
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
        }).mount('.amazonpay-field');

        window.amazonpay.submit();
    }

    // PAYPAL
    window.paypalButtons = new PayPal(window.checkout, {
        onAuthorized(data, actions) {
            console.log('onAuthorized', data, actions);
            actions.resolve();
        }
    }).mount('.paypal-field');

    // GOOGLE PAY
    const googlepay = new GooglePay(window.checkout, {
        // environment: 'PRODUCTION',
        environment: 'TEST',

        // Callbacks
        onAuthorized(data, actions) {
            console.log('onAuthorized', data, actions);
            actions.resolve();
        },

        // Payment info
        countryCode: 'NL',

        // Shopper info (optional)
        emailRequired: true,
        billingAddressRequired: true,
        shippingAddressRequired: true,

        // Button config (optional)
        buttonSizeMode: 'fill',
        buttonType: 'long', // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
        buttonColor: 'default', // https://developers.google.com/pay/api/web/reference/object#ButtonOptions

        // Analytics info
        isExpress: true,
        expressPage: 'pdp',
        buttonRadius: 20
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
    const applepay = new ApplePay(window.checkout, {
        onClick: (resolve, reject) => {
            console.log('Apple Pay - Button clicked');
            resolve();
        },
        onAuthorized: (data, actions) => {
            console.log('Apple Pay onAuthorized', event);
            actions.resolve();
        },
        buttonType: 'buy'
    });

    applepay
        .isAvailable()
        .then(isAvailable => {
            if (isAvailable) {
                // For this Demo only
                document.querySelector('#applepay').classList.remove('merchant-checkout__payment-method--hidden');
                // Required: mount ApplePay component
                applepay.mount('.applepay-field');
            }
        })
        .catch(e => {
            console.warn(e);
        });
});
