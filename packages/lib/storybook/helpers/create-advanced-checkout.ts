import AdyenCheckout from '../../src/index';
import { cancelOrder, checkBalance, createOrder, getPaymentMethods } from './checkout-api-calls';
import { handleAdditionalDetails, handleChange, handleError, handleSubmit } from './checkout-handlers';
import getCurrency from '../utils/get-currency';
import { AdyenCheckoutProps } from '../stories/types';
import { PaymentMethodsResponse } from '../../src/core/ProcessResponse/PaymentMethodsResponse/types';
import Checkout from '../../src/core/core';

async function createAdvancedFlowCheckout({
    showPayButton,
    paymentMethodsConfiguration,
    countryCode,
    shopperLocale,
    amount
}: AdyenCheckoutProps): Promise<Checkout> {
    const paymentAmount = {
        currency: getCurrency(countryCode),
        value: Number(amount)
    };

    const paymentMethodsResponse: PaymentMethodsResponse = await getPaymentMethods({ amount: paymentAmount, shopperLocale, countryCode });

    const checkout = await AdyenCheckout({
        clientKey: process.env.CLIENT_KEY,
        environment: process.env.CLIENT_ENV,
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

        // @ts-ignore ignore
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
