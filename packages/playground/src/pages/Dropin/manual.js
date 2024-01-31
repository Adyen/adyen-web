import { AdyenCheckout, Dropin, Card, GooglePay, PayPal, Ach, Affirm, WeChat, Giftcard, AmazonPay } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { getPaymentMethods, makePayment, checkBalance, createOrder, cancelOrder, makeDetailsCall } from '../../services';
import { amount, shopperLocale, countryCode } from '../../config/commonConfig';
import { getSearchParameters } from '../../utils';
import getTranslationFile from '../../config/getTranslation';

export async function initManual() {
    const paymentMethodsResponse = await getPaymentMethods({ amount, shopperLocale });

    window.checkout = await AdyenCheckout({
        amount,
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,

        locale: 'pt-BR',
        translationFile: getTranslationFile(shopperLocale),
        // translationFile: nl_NL,

        environment: process.env.__CLIENT_ENV__,
        onSubmit: async (state, component) => {
            const result = await makePayment(state.data);

            // handle actions
            if (result.action) {
                // demo only - store paymentData & order
                if (result.action.paymentData) localStorage.setItem('storedPaymentData', result.action.paymentData);
                component.handleAction(result.action, { challengeWindowSize: '01' });
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
        // srConfig: { showPanel: true },
        // onChange: state => {
        //     console.log('onChange', state);
        // },
        onAdditionalDetails: async (state, component) => {
            const result = await makeDetailsCall(state.data);

            if (result.action) {
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
        onError: (error, component) => {
            console.info(error.name, error.message, error.stack, component);
        },
        onActionHandled: rtnObj => {
            console.log('onActionHandled', rtnObj);
        }
    });

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
        const { amazonCheckoutSessionId, redirectResult, payload } = getSearchParameters(window.location.search);

        if (redirectResult || payload) {
            dropin.setStatus('loading');
            return makeDetailsCall({
                ...(storedPaymentData && { paymentData: storedPaymentData }),
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

        // Handle Amazon Pay redirect result
        if (amazonCheckoutSessionId) {
            window.amazonpay = new AmazonPay({
                core: checkout,
                amazonCheckoutSessionId,
                showOrderButton: false,
                onSubmit: state => {
                    makePayment(state.data).then(result => {
                        if (result.action) {
                            dropin.handleAction(result.action);
                        } else {
                            handleFinalState(result.resultCode, dropin);
                        }
                    });
                }
            }).mount('body');

            window.amazonpay.submit();
        }

        return Promise.resolve(true);
    }

    const dropin = new Dropin({
        core: checkout,
        paymentMethodComponents: [Card, GooglePay, PayPal, Ach, Affirm, WeChat, Giftcard, AmazonPay],
        instantPaymentTypes: ['googlepay'],
        paymentMethodsConfiguration: {
            card: {
                challengeWindowSize: '03',
                enableStoreDetails: true,
                hasHolderName: true,
                holderNameRequired: true
            },
            paywithgoogle: {
                buttonType: 'plain'
            },
            klarna: {
                useKlarnaWidget: true
            }
            // storedCard: {
            //     hideCVC: true
            // }
        }
    }).mount('#dropin-container');

    handleRedirectResult();

    return [checkout, dropin];
}
