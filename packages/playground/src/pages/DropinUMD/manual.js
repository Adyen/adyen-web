import '@adyen/adyen-web/styles/adyen.css';
import { getPaymentMethods, makePayment, checkBalance, createOrder, cancelOrder, makeDetailsCall } from '../../services';
import { amount, shopperLocale, countryCode, returnUrl } from '../../config/commonConfig';
import { getSearchParameters } from '../../utils';
import getTranslationFile from '../../config/getTranslation';

export async function initManual() {
    const paymentMethodsResponse = await getPaymentMethods({ amount, shopperLocale });

    const { AdyenCheckout, Dropin } = window.AdyenWeb;

    window.checkout = await AdyenCheckout({
        amount,
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        translationFile: getTranslationFile(shopperLocale),
        environment: process.env.__CLIENT_ENV__,
        onSubmit: async (state, component, actions) => {
            try {
                const { action, order, resultCode, donationToken } = await makePayment(state.data);

                if (!resultCode) actions.reject();

                actions.resolve({
                    resultCode,
                    action,
                    order,
                    donationToken
                });
            } catch (error) {
                console.error('## onSubmit - critical error', error);
                actions.reject();
            }
        },
        onAdditionalDetails: async (state, component, actions) => {
            try {
                const { resultCode, action, order, donationToken } = await makeDetailsCall(state.data);

                if (!resultCode) actions.reject();

                actions.resolve({
                    resultCode,
                    action,
                    order,
                    donationToken
                });
            } catch (error) {
                console.error('## onAdditionalDetails - critical error', error);
                actions.reject();
            }
        },
        onPaymentCompleted(data, component) {
            component.setStatus('success');
        },
        onPaymentFailed(data, component) {
            component.setStatus('error');
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
            window.amazonpay = new AmazonPay(checkout, {
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

    const dropin = new Dropin(checkout, {
        instantPaymentTypes: ['googlepay'],
        paymentMethodsConfiguration: {
            card: {
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
        }
    }).mount('#dropin-container');

    handleRedirectResult();

    return [checkout, dropin];
}
