import {
    AdyenCheckout,
    ApplePay,
    Dropin,
    Card,
    GooglePay,
    PayPal,
    Ach,
    Affirm,
    WeChat,
    Giftcard,
    AmazonPay,
    Pix,
    Klarna,
    Bancontact,
    SepaDirectDebit,
    OnlineBankingCZ,
    BacsDirectDebit,
    BankTransfer,
    CashAppPay,
    Twint,
    BcmcMobile,
    Blik,
    UPI
} from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { getPaymentMethods, makePayment, checkBalance, createOrder, cancelOrder, makeDetailsCall } from '../../services';
import { amount, shopperLocale, countryCode, environmentUrlsOverride } from '../../config/commonConfig';
import { getSearchParameters } from '../../utils';
import { handleOnPaymentCompleted, handleOnPaymentFailed } from '../../handlers';

export async function initManual() {
    const paymentMethodsResponse = await getPaymentMethods({ amount, shopperLocale });

    window.checkout = await AdyenCheckout({
        amount,
        countryCode,
        clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,

        locale: shopperLocale,

        ...environmentUrlsOverride,

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
        onOrderCancel: async (order, actions) => {
            await cancelOrder(order);
            actions.resolve({ amount });
        },
        onError: (error, component) => {
            console.info(error.name, error.message, error.stack, component);
        },
        onActionHandled: rtnObj => {
            console.log('manual::onActionHandled', rtnObj);
        },
        onPaymentMethodsRequest: async (data, { resolve, reject }) => {
            console.log('onPaymentMethodsRequest', data);
            resolve(await getPaymentMethods({ amount, shopperLocale: data.locale, order: data.order }));
        },
        onPaymentCompleted: handleOnPaymentCompleted,
        onPaymentFailed: handleOnPaymentFailed
    });

    function handleFinalState(resultCode, dropin) {
        if (resultCode === 'Authorised' || resultCode === 'Received') {
            dropin.setStatus('success');
        } else {
            dropin.setStatus('error');
        }
    }

    function handleRedirectResult() {
        const { amazonCheckoutSessionId, redirectResult, payload } = getSearchParameters(window.location.search);

        if (redirectResult) {
            window.checkout.submitDetails({ details: { redirectResult } });
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
        paymentMethodComponents: [
            Card,
            ApplePay,
            GooglePay,
            PayPal,
            Ach,
            Affirm,
            WeChat,
            Giftcard,
            AmazonPay,
            Pix,
            Bancontact,
            Klarna,
            SepaDirectDebit,
            OnlineBankingCZ,
            BacsDirectDebit,
            BankTransfer,
            CashAppPay,
            Twint,
            BcmcMobile,
            Blik,
            UPI
        ],
        instantPaymentTypes: ['googlepay', 'applepay'],
        paymentMethodsConfiguration: {
            card: {
                challengeWindowSize: '03',
                enableStoreDetails: true
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
