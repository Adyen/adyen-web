import AdyenCheckout from '../../../src';
import { makeDetailsCall, makePayment, getOriginKey, getPaymentMethods } from '../../services';
import { amount, shopperLocale, countryCode } from '../../config/commonConfig';
import { getSearchParameters } from '../../utils';
import '../../../config/polyfills';
import '../../style.scss';

const initCheckout = paymentMethodsResponse => {
    console.log('### Dropin::initCheckout:: paymentMethodsResponse', paymentMethodsResponse);

    //    paymentMethodsResponse.paymentMethods[0].configuration = { koreanAuthenticationRequired: true }; // TODO - for Testing
    //    paymentMethodsResponse.paymentMethods[1].configuration = { merchantId: 'zebadee', intent: 'authorize' }; // TODO - for Testing
    //    paymentMethodsResponse.paymentMethods[11].configuration = { merchantId: 'florence' }; // TODO - for Testing

    window.checkout = new AdyenCheckout({
        amount, // Optional. Used to display the amount in the Pay Button.
        countryCode,
        originKey,
        // clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: 'test',
        installmentOptions: {
            // card: {
            //     values: [1, 2]
            // },
            mc: {
                values: [1, 2, 3, 4]
            },
            visa: {
                values: [1, 2, 3]
            }
        }
        // risk: { enabled: false }
        // allowPaymentMethods: ['ideal', 'visa'],
        // removePaymentMethods: ['paypal', 'klarna'],
    });
};

const initDropin = () => {
    const dropin = checkout
        .create('dropin', {
            paymentMethodsConfiguration: {
                card: {
                    // name: 'Debit Card'
                    enableStoreDetails: false,
                    hasHolderName: true,
                    holderNameRequired: true,
                    // holderName: 'J. Smith',
                    //                    configuration: {
                    //                        koreanAuthenticationRequired: false
                    //                    },
                    countryCode: 'kr'
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
                    //                        merchantId: '5RZKQX2FC48EA',
                    //                        intent: 'capture'
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
            },

            // Events
            onSubmit: (state, component) => {
                component.setStatus('loading');

                makePayment(state.data)
                    .then(result => {
                        if (result.action) {
                            // demo only - store paymentData
                            if (result.action.paymentData) {
                                localStorage.setItem('storedPaymentData', result.action.paymentData);
                            }

                            component.handleAction(result.action);
                        } else {
                            handleFinalState(result.resultCode, component);
                        }
                    })
                    .catch(error => {
                        throw Error(error);
                    });
            },
            onAdditionalDetails: (state, component) => {
                makeDetailsCall(state.data).then(result => {
                    if (result.action) {
                        component.handleAction(result.action);
                    } else {
                        handleFinalState(result.resultCode, component);
                    }
                });
            },

            onError: error => {
                console.log('dropin onError', error);
            },

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

    window.dropin = dropin;
    window.checkout = checkout;

    return checkout;
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

getOriginKey()
    .then(originKey => {
        window.originKey = originKey;
    })
    .then(() => getPaymentMethods({ amount, shopperLocale }))
    .then(initCheckout)
    .then(initDropin)
    .then(handleRedirectResult);
