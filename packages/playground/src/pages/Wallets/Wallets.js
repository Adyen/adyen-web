import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { getPaymentMethods, makePayment, patchPaypalOrder } from '../../services';
import { handleSubmit, handleAdditionalDetails, handleResponse } from '../../handlers';
import { checkPaymentResult } from '../../utils';
import { amount, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

getPaymentMethods({ amount, shopperLocale }).then(async paymentMethodsResponse => {
    window.checkout = await AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: process.env.__CLIENT_ENV__,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError(error) {
            console.log(error);
        },
        showPayButton: true
    });

    // // Cash App Pay
    // window.cashApp = checkout
    //     .create('cashapp', {
    //         onClick(actions) {
    //             console.log('CashAppApp: onClick');
    //             actions.resolve();
    //         }
    //     })
    //     .mount('.cashapp-field');

    // // CLICK TO PAY
    // window.clickToPay = checkout.create('clicktopay', {
    //     shopperEmail: 'shopper@example.com',
    //     onReady() {
    //         console.log('ClickToPay is ready');
    //     },
    //     onTimeout(error) {
    //         console.log(error);
    //     }
    // });
    // window.clickToPay
    //     .isAvailable()
    //     .then(() => {
    //         document.querySelector('#clicktopay').classList.remove('merchant-checkout__payment-method--hidden');
    //         window.clickToPay.mount('.clicktopay-field');
    //     })
    //     .catch(e => {
    //         console.warn('ClickToPay is NOT available');
    //     });

    // // AMAZON PAY
    // // Demo only
    // const urlSearchParams = new URLSearchParams(window.location.search);
    // const amazonCheckoutSessionId = urlSearchParams.get('amazonCheckoutSessionId');
    // const step = urlSearchParams.get('step');

    // const chargeOptions = {
    //     // chargePermissionType: 'Recurring',
    //     // recurringMetadata: {
    //     //     frequency: {
    //     //         unit: 'Month',
    //     //         value: '1'
    //     //     }
    //     // }
    // };

    // // Initial state
    // if (!step) {
    //     window.amazonpay = checkout
    //         .create('amazonpay', {
    //             productType: 'PayOnly',
    //             ...chargeOptions,
    //             // Regular checkout:
    //             // returnUrl: 'http://localhost:3020/wallets?step=result',
    //             // checkoutMode: 'ProcessOrder'

    //             // Express Checkout flow:
    //             returnUrl: 'http://localhost:3020/wallets?step=review'
    //         })
    //         .mount('.amazonpay-field');
    // }

    // // Review and confirm order
    // if (step === 'review') {
    //     window.amazonpay = checkout
    //         .create('amazonpay', {
    //             ...chargeOptions,
    //             /**
    //              * The merchant will receive the amazonCheckoutSessionId attached in the return URL.
    //              */
    //             amazonCheckoutSessionId,
    //             cancelUrl: 'http://localhost:3020/wallets',
    //             returnUrl: 'http://localhost:3020/wallets?step=result'
    //         })
    //         .mount('.amazonpay-field');
    // }

    // // Make payment
    // if (step === 'result') {
    //     window.amazonpay = checkout
    //         .create('amazonpay', {
    //             /**
    //              * The merchant will receive the amazonCheckoutSessionId attached in the return URL.
    //              */
    //             amazonCheckoutSessionId,
    //             showOrderButton: false,
    //             onSubmit: (state, component) => {
    //                 return makePayment(state.data)
    //                     .then(response => {
    //                         if (response.action) {
    //                             component.handleAction(response.action);
    //                         } else if (response?.resultCode && checkPaymentResult(response.resultCode)) {
    //                             alert(response.resultCode);
    //                         } else {
    //                             // Try handling the decline flow
    //                             // This will redirect the shopper to select another payment method
    //                             component.handleDeclineFlow();
    //                         }
    //                     })
    //                     .catch(error => {
    //                         throw Error(error);
    //                     });
    //             },
    //             onError: e => {
    //                 if (e.resultCode) {
    //                     alert(e.resultCode);
    //                 } else {
    //                     console.error(e);
    //                 }
    //             }
    //         })
    //         .mount('.amazonpay-field');

    //     window.amazonpay.submit();
    // }

    // PAYPAL
    window.paypalButtons = checkout
        .create('paypal', {
            isExpress: true,

            userAction: 'continue',

            onSubmit: async (state, component) => {
                const response = await makePayment(state.data);
                component.setStatus('ready');

                window.paypalPatchData = {
                    pspReference: response.pspReference
                };

                console.log(window.paypalPatchData);

                handleResponse(response, component);
            },

            onError: (error, component) => {
                component.setStatus('ready');
                console.log('paypal onError', error);
            },

            onShippingAddressChange: async (data, actions, component) => {
                console.log('onShippingAddressChange', data, actions, component);

                const patch = {
                    pspReference: window.paypalPatchData.pspReference,
                    paymentData: component.paymentData,
                    amount: {
                        currency: 'USD',
                        value: 28000
                    }
                };

                console.log('### onShippingAddressChange', patch, data);
                if (data.shippingAddress.countryCode === 'US') {
                    const { paymentData } = await patchPaypalOrder(patch);
                    component.updatePaymentData(paymentData);
                    return;
                }

                return actions.reject();
            },

            onShopperDetails(shopperDetails, paypalOrder, actions) {
                console.log(shopperDetails, paypalOrder, actions);
                actions.resolve();
            }

            // onShippingChange: async (data, actions) => {
            //     console.log(data);
            //     console.log('onShippingChange');
            //
            //     const patch = {
            //         pspReference: window.paypalPatchData.pspReference,
            //         paymentData: window.paypalPatchData.paymentData,
            //         amount: {
            //             currency: 'USD',
            //             value: 28000
            //         }
            //     };
            //
            //     console.log('### onShippingChange', patch, data);
            //     if (data.shipping_address.country_code === 'US') {
            //         await patchPaypalOrder(patch);
            //         return actions.resolve();
            //     }
            //
            //     return actions.reject();
            // }

            // onShippingChange(data, actions) {
            //     console.log('onShippingChange');
            //
            //     const patch = {
            //         pspReference: window.paypalPatchData.pspReference,
            //         paymentData: window.paypalPatchData.paymentData,
            //         amount: {
            //             currency: 'USD',
            //             value: 20000
            //         }
            //     };
            //
            //     console.log('### onShippingChange', patch, data);
            //     if (data.shipping_address.country_code === 'US') {
            //         return patchPaypalOrder(patch);
            //     }
            //
            //     return actions.reject();
            // }
        })
        .mount('.paypal-field');

    // // GOOGLE PAY
    // const googlepay = checkout.create('paywithgoogle', {
    //     // environment: 'PRODUCTION',
    //     environment: 'TEST',

    //     // Callbacks
    //     onAuthorized: console.info,
    //     // onError: console.error,

    //     // Payment info
    //     countryCode: 'NL',

    //     // Merchant config (required)
    //     //            configuration: {
    //     //                gatewayMerchantId: 'TestMerchant', // name of MerchantAccount
    //     //                merchantName: 'Adyen Test merchant', // Name to be displayed
    //     //                merchantId: '06946223745213860250' // Required in Production environment. Google's merchantId: https://developers.google.com/pay/api/web/guides/test-and-deploy/deploy-production-environment#obtain-your-merchantID
    //     //            },

    //     // Shopper info (optional)
    //     emailRequired: true,
    //     shippingAddressRequired: true,
    //     shippingAddressParameters: {}, // https://developers.google.com/pay/api/web/reference/object#ShippingAddressParameters

    //     // Button config (optional)
    //     buttonType: 'long', // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
    //     buttonColor: 'default' // https://developers.google.com/pay/api/web/reference/object#ButtonOptions
    // });

    // // First, check availability. If environment is TEST, Google Pay will always be considered available.
    // googlepay
    //     .isAvailable()
    //     .then(() => {
    //         googlepay.mount('.googlepay-field');
    //     })
    //     .catch(e => console.warn(e));

    // window.googlepay = googlepay;

    // // APPLE PAY
    // const applepay = checkout.create('applepay', {
    //     onClick: (resolve, reject) => {
    //         console.log('Apple Pay - Button clicked');
    //         resolve();
    //     },
    //     onAuthorized: (resolve, reject, event) => {
    //         console.log('Apple Pay onAuthorized', event);
    //         resolve();
    //     },
    //     buttonType: 'buy'
    // });

    // applepay
    //     .isAvailable()
    //     .then(isAvailable => {
    //         if (isAvailable) {
    //             // For this Demo only
    //             document.querySelector('#applepay').classList.remove('merchant-checkout__payment-method--hidden');
    //             // Required: mount ApplePay component
    //             applepay.mount('.applepay-field');
    //         }
    //     })
    //     .catch(e => {
    //         console.warn(e);
    //     });
});
