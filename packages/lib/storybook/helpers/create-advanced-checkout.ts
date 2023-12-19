import { AdyenCheckout } from '../../src/index';
import { cancelOrder, checkBalance, createOrder, getPaymentMethods, makePayment } from './checkout-api-calls';
import { handleAdditionalDetails, handleChange, handleError, handleFinalState } from './checkout-handlers';
import getCurrency from '../utils/get-currency';
import { AdyenCheckoutProps } from '../stories/types';
import Checkout from '../../src/core/core';
import { PaymentMethodsResponse } from '../../src/types';

async function createAdvancedFlowCheckout({
    showPayButton,
    countryCode,
    shopperLocale,
    amount
}: AdyenCheckoutProps): Promise<Checkout> {
    const paymentAmount = {
        currency: getCurrency(countryCode),
        value: Number(amount)
    };

    const paymentMethodsResponse: PaymentMethodsResponse = await getPaymentMethods({
        amount: paymentAmount,
        shopperLocale,
        countryCode
    });

    const checkout = await AdyenCheckout({
        clientKey: process.env.CLIENT_KEY,
        environment: process.env.CLIENT_ENV,
        amount: paymentAmount,
        countryCode,
        paymentMethodsResponse,
        locale: shopperLocale,
        showPayButton,

        onSubmit: async (state, component, actions) => {
            try {
                const paymentData = {
                    amount: paymentAmount,
                    countryCode,
                    shopperLocale
                };

                const result = await makePayment(state.data, paymentData);

                // happpy flow
                if (result.resultCode.includes('Refused', 'Cancelled', 'Error')) {
                    actions.reject({
                        error: {
                            googlePayError: {}
                        }
                    });
                } else {
                    actions.resolve({
                        action: result.action,
                        order: result.order,
                        resultCode: result.resultCode
                    });
                }
            } catch (error) {
                // Something failed in the request
                actions.reject();
            }
        },

        onChange: (state, component) => {
            handleChange(state, component);
        },

        onAdditionalDetails: async (state, component) => {
            await handleAdditionalDetails(state, component, checkout);
        },

        onBalanceCheck: async (resolve, reject, data) => {
            const payload = {
                amount: paymentAmount,
                ...data
            };
            try {
                const res = await checkBalance(payload);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        },

        onOrderRequest: async (resolve, reject) => {
            try {
                const order = await createOrder(paymentAmount);
                resolve(order);
            } catch (e) {
                reject(e);
            }
        },

        onOrderCancel: async order => {
            await cancelOrder(order);
            await checkout.update({
                paymentMethodsResponse: await getPaymentMethods({ amount: paymentAmount, shopperLocale, countryCode }),
                order: null,
                amount: paymentAmount
            });
        },

        onError: (error, component) => {
            handleError(error, component);
        },

        onPaymentCompleted: (result, component) => {
            handleFinalState(result, component);
        }
    });

    return checkout;
}

export { createAdvancedFlowCheckout };
