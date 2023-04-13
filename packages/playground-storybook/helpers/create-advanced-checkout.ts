import AdyenCheckout from '@adyen/adyen-web';
import { PaymentMethodsResponseObject } from '@adyen/adyen-web/dist/types/core/ProcessResponse/PaymentMethodsResponse/types';
import Core from '@adyen/adyen-web/dist/types/core';
import { cancelOrder, checkBalance, createOrder, getPaymentMethods } from './checkout-api-calls';
import { handleAdditionalDetails, handleChange, handleError, handleSubmit } from './checkout-handlers';
import getCurrency from '../utils/get-currency';
import { AdyenCheckoutProps } from '../stories/types';

async function createAdvancedFlowCheckout({
    showPayButton,
    paymentMethodsConfiguration,
    countryCode,
    shopperLocale,
    amount
}: AdyenCheckoutProps): Promise<Core> {
    const paymentAmount = {
        currency: getCurrency(countryCode),
        value: Number(amount)
    };

    const paymentMethodsResponse: PaymentMethodsResponseObject = await getPaymentMethods({ amount: paymentAmount, shopperLocale, countryCode });

    const checkout = await AdyenCheckout({
        clientKey: import.meta.env.VITE_CLIENT_KEY,
        environment: import.meta.env.VITE_CLIENT_ENV,
        amount: paymentAmount,
        countryCode,
        paymentMethodsResponse,
        locale: shopperLocale,
        showPayButton,
        paymentMethodsConfiguration,

        onSubmit: async (state, component) => {
            const paymentData = {
                amount: paymentAmount,
                countryCode,
                shopperLocale
            };
            await handleSubmit(state, component, checkout, paymentData);
        },

        onChange: (state, component) => {
            handleChange(state, component);
        },

        onAdditionalDetails: async (state, component) => {
            await handleAdditionalDetails(state, component, checkout);
        },

        onBalanceCheck: async (resolve, reject, data) => {
            resolve(await checkBalance(data));
        },

        onOrderRequest: async (resolve, reject) => {
            resolve(await createOrder(paymentAmount));
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
        }
    });

    return checkout;
}

export { createAdvancedFlowCheckout };
