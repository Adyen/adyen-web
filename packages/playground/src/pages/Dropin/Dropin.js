import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { makeDetailsCall, makePayment, getPaymentMethods, checkBalance, createOrder, cancelOrder } from '../../services';
import { amount, shopperLocale, countryCode } from '../../config/commonConfig';
import { getSearchParameters } from '../../utils';
import '../../../config/polyfills';
import '../../style.scss';

const initCheckout = async () => {
    const paymentMethodsResponse = await getPaymentMethods({ amount, shopperLocale });

    window.checkout = new AdyenCheckout({
        amount,
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: 'test',
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
                // demo only - store paymentData & order
                if (result.action.paymentData) localStorage.setItem('storedPaymentData', result.action.paymentData);
                component.handleAction(result.action);
            } else if (result.order && result.order?.remainingAmount?.value > 0) {
                // handle orders
                const order = {
                    orderData: result.order.orderData,
                    pspReference: result.order.pspReference
                };

                const orderPaymentMethods = await getPaymentMethods({ order, amount, shopperLocale });
                checkout.update({ paymentMethodsResponse: orderPaymentMethods, order, amount: result.order.remainingAmount });
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
        onOrderCancel: async order => {
            await cancelOrder(order);
            checkout.update({ paymentMethodsResponse: await getPaymentMethods({ amount, shopperLocale }), order: null, amount });
        },
        onError: error => {
            console.log('dropin onError', error);
        },
        paymentMethodsConfiguration: {
            card: {
                enableStoreDetails: false,
                hasHolderName: true,
                holderNameRequired: true
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
                onAuthorized: console.info
            },
            paypal: {
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

    window.dropin = checkout.create('dropin').mount('#dropin-container');
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
        dropin.setStatus('loading');
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

initCheckout().then(handleRedirectResult);
