import {
    AdyenCheckout,
    Dropin,
    Card,
    GooglePay,
    PayPal,
    Ach,
    Affirm,
    WeChat,
    Giftcard,
    AmazonPay
} from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import {
    getPaymentMethods,
    makePayment,
    checkBalance,
    createOrder,
    cancelOrder,
    makeDetailsCall
} from '../../services';
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

        environment: process.env.__CLIENT_ENV__,

        onSubmit: async (state, component, actions) => {
            console.log('onSubmit', state, component.authorizedEvent);

            try {
                const result = await makePayment(state.data);

                if (!result.resultCode) actions.reject();

                if (result.resultCode.includes('Refused', 'Cancelled', 'Error')) {
                    actions.reject({
                        resultCode: result.resultCode
                        // error: {
                        //     googlePayError: {},
                        //     applePayError: {}
                        // }
                    });
                } else {
                    actions.resolve({
                        action: result.action,
                        order: result.order,
                        resultCode: result.resultCode,
                        donationToken: result.donationToken
                    });
                }
            } catch (error) {
                console.error('## onSubmit - critical error', error);
                actions.reject();
            }
        },

        onChange(state, element) {
            console.log('onChange', state, element);
        },

        onPaymentCompleted(result, element) {
            console.log('onPaymentCompleted', result, element);
        },
        onPaymentFailed(result, element) {
            console.log('onPaymentFailed', result, element);
        },

        onAdditionalDetails: async (state, component, actions) => {
            try {
                const result = await makeDetailsCall(state.data);

                if (!result.resultCode) actions.reject();

                if (result.resultCode.includes('Refused', 'Cancelled', 'Error')) {
                    actions.reject({
                        resultCode: result.resultCode
                        // error: {
                        //     googlePayError: {},
                        //     applePayError: {}
                        // }
                    });
                } else {
                    actions.resolve({
                        action: result.action,
                        order: result.order,
                        resultCode: result.resultCode,
                        donationToken: result.donationToken
                    });
                }
            } catch (error) {
                console.error('## onAdditionalDetails - critical error', error);
                actions.reject();
            }
        },
        onBalanceCheck: async (resolve, reject, data) => {
            console.log('onBalanceCheck', data);
            resolve(await checkBalance(data));
        },
        onOrderRequest: async resolve => {
            console.log('onOrderRequested');
            resolve(await createOrder({ amount }));
        },
        onOrderUpdated: data => {
            console.log('onOrderUpdated', data);
        },
        onOrderCancel: async order => {
            await cancelOrder(order);
            checkout.update({
                paymentMethodsResponse: await getPaymentMethods({ amount, shopperLocale }),
                order: null,
                amount
            });
        },
        onError: (error, component) => {
            console.info(error.name, error.message, error.stack, component);
        },
        onActionHandled: rtnObj => {
            console.log('onActionHandled', rtnObj);
        },
        onPaymentMethodsRequest: async (data, { resolve, reject }) => {
            console.log('onPaymentMethodsRequest', data);
            resolve(await getPaymentMethods({ amount, shopperLocale: data.locale, order: data.order }));
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

    // const gpay = new GooglePay({
    //     core: checkout,
    //     shippingAddressRequired: true,
    //     shippingAddressParameters: {
    //         phoneNumberRequired: true
    //     },

    //     billingAddressRequired: true
    // }).mount('#dropin-container');

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

    return [checkout];
}
