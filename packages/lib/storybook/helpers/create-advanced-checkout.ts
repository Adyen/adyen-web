import { AdyenCheckout } from '../../src/core/AdyenCheckout';
import { cancelOrder, checkBalance, createOrder, getPaymentMethods, makeDetailsCall, makePayment } from './checkout-api-calls';
import { handleError, handleFinalState } from './checkout-handlers';
import getCurrency from '../utils/get-currency';
import { AdyenCheckoutProps } from '../stories/types';
import Checkout from '../../src/core/core';
import { PaymentMethodsResponse } from '../../src/types';

async function createAdvancedFlowCheckout({
    showPayButton,
    countryCode,
    shopperLocale,
    amount,
    paymentMethodsOverride,
    paymentsOptions,
    ...restCheckoutProps
}: AdyenCheckoutProps): Promise<Checkout> {
    const paymentAmount = {
        currency: getCurrency(countryCode),
        value: Number(amount)
    };

    const _paymentMethodsResponse: PaymentMethodsResponse = await getPaymentMethods({
        amount: paymentAmount,
        shopperLocale,
        countryCode
    });

    const paymentMethodsResponse = !paymentMethodsOverride
        ? _paymentMethodsResponse
        : {
              storedPaymentMethods: [
                  ...(_paymentMethodsResponse.storedPaymentMethods ? _paymentMethodsResponse.storedPaymentMethods : []),
                  ...(paymentMethodsOverride.storedPaymentMethods ? paymentMethodsOverride.storedPaymentMethods : [])
              ],
              paymentMethods: [
                  ...(_paymentMethodsResponse.paymentMethods ? _paymentMethodsResponse.paymentMethods : []),
                  ...(paymentMethodsOverride.paymentMethods ? paymentMethodsOverride.paymentMethods : [])
              ]
          };

    const checkout = await AdyenCheckout({
        clientKey: process.env.CLIENT_KEY,
        // @ts-ignore CLIENT_ENV has valid value
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
                    shopperLocale,
                    ...(paymentsOptions && paymentsOptions)
                };

                const { action, order, resultCode, donationToken } = await makePayment(state.data, paymentData);

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

        onPaymentCompleted(result, element) {
            console.log('onPaymentCompleted', result, element);
            handleFinalState(result, element);
        },

        onPaymentFailed(result, element) {
            console.log('onPaymentFailed', result, element);
            handleFinalState(result, element);
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
            await cancelOrder(order.order);
            await checkout.update({
                paymentMethodsResponse: await getPaymentMethods({ amount: paymentAmount, shopperLocale, countryCode }),
                order: null,
                amount: paymentAmount
            });
        },

        onError: (error, component) => {
            handleError(error, component);
        },

        ...restCheckoutProps
    });

    return checkout;
}

export { createAdvancedFlowCheckout };
