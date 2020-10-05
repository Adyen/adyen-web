import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { makeDetailsCall, makePayment, getPaymentMethods, checkBalance, createOrder } from '../../services';
import { amount, shopperLocale, countryCode } from '../../config/commonConfig';
import { getSearchParameters } from '../../utils';
import '../../../config/polyfills';
import '../../style.scss';

const initCheckout = paymentMethodsResponse => {
    window.checkout = new AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: 'http://localhost:8080/checkoutshopper/', //'test', // TODO
        installmentOptions: {
            mc: {
                values: [1, 2, 3, 4]
            }
        },
        onSubmit: async (state, component) => {
            component.setStatus('loading');
            const result = await makePayment(state.data);

            // handle actions
            if (result.action) {
                if (result.action.paymentData) {
                    // demo only - store paymentData
                    localStorage.setItem('storedPaymentData', result.action.paymentData);
                }

                component.handleAction(result.action);
            } else if (result.order && result.order?.remainingAmount?.value > 0) {
                // handle orders
                component.unmount();
                const orderPaymentMethods = await getPaymentMethods({
                    order: {
                        orderData: result.order.orderData,
                        pspReference: result.order.pspReference
                    }
                });

                checkout
                    .setPaymentMethodsResponse(orderPaymentMethods)
                    .create('dropin', { order: result.order })
                    .mount('#dropin-container');
            } else {
                handleFinalState(result.resultCode, component);
            }
        },
        onAdditionalDetails: async (state, component) => {
            const result = await makeDetailsCall(state.data);

            if (result.action) {
                component.handleAction(result.action);
            } else {
                handleFinalState(result.resultCode, component);
            }
        },

        onBalanceCheck: async (resolve, reject, data) => {
            resolve(await checkBalance(data));
        },
        onOrderRequest: async (resolve, reject) => {
            resolve(await createOrder({ amount }));
        },

        onError: error => {
            console.log('dropin onError', error);
        },

        paymentMethodsConfiguration: {
            card: {
                // name: 'Debit Card'
                enableStoreDetails: false,
                hasHolderName: true,
                holderNameRequired: true
                // holderName: 'J. Smith',
                //                    koreanAuthenticationRequired: false,
                //                    configuration: {
                //                        koreanAuthenticationRequired: false
                //                    },
                //                    countryCode: 'kr'
            },
            boletobancario_santander: {
                data: {
                    socialSecurityNumber: '56861752509',
                    billingAddress: {
                        street: 'Roque Petroni Jr',
                        postalCode: '59000060',
                        city: 'São Paulo',
                        houseNumberOrName: '999',
                        country: 'BR',
                        stateOrProvince: 'SP'
                    }
                }
            },
            paywithgoogle: {
                countryCode: 'NL',
                //                    configuration: {
                //                        gatewayMerchantId: 'TestMerchantCheckout', // name of MerchantAccount
                //                        merchantName: 'Adyen Test merchant' // Name to be displayed
                //                    },
                onAuthorized: console.info
            },
            paypal: {
                // USE either separate merchantId & intent props...
                //                    merchantId: '5RZKQX2FC48EA',
                //                    intent: 'capture',
                //                    // ...OR, preferably, wrap them in a configuration object
                //                    configuration: {
                //                        merchantId: '5RZKQX2FC48EAxxx',
                //                        intent: 'sale'
                //                    },
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
            }
        }
    });
};

const initDropin = () => {
    window.dropin = checkout
        .create('dropin', {
            showRemovePaymentMethodButton: true,
            onDisableStoredPaymentMethod: (storedPaymentMethodId, resolve, reject) => {
                // call disable endpoint and resolve()
            },

            // Options
            openFirstPaymentMethod: true, // defaults to true
            openFirstStoredPaymentMethod: true, // defaults to true
            showStoredPaymentMethods: true, // defaults to true,
            showPaymentMethods: true, // defaults to true
            showPayButton: true // defaults to true
        })
        .mount('#dropin-container');
};

function handleFinalState(resultCode, dropin) {
    localStorage.removeItem('storedPaymentData');

    if (resultCode === 'Authorised' || resultCode === 'Received') {
        dropin.setStatus('success');
    } else {
        dropin.setStatus('error');
    }
}

function handleRedirectResult() {
    const storedPaymentData = localStorage.getItem('storedPaymentData');
    const { redirectResult, payload } = getSearchParameters(window.location.search);

    if (storedPaymentData && (redirectResult || payload)) {
        return makeDetailsCall({
            paymentData: storedPaymentData,
            details: {
                ...(redirectResult && { redirectResult }),
                ...(payload && { payload })
            }
        }).then(result => {
            if (result.action) {
                dropin.handleAction(result.action);
            } else {
                handleFinalState(result.resultCode, dropin);
            }

            return true;
        });
    }

    return Promise.resolve(true);
}

getPaymentMethods({ amount, shopperLocale })
    .then(initCheckout)
    .then(initDropin)
    .then(handleRedirectResult);
