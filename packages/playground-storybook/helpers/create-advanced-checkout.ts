import AdyenCheckout from '@adyen/adyen-web';
import { amount, countryCode, shopperLocale } from '../config/commonConfig';
import { cancelOrder, checkBalance, createOrder, makeDetailsCall, makePayment, getPaymentMethods } from './checkout-api-calls';
import { PaymentMethodsResponseObject } from '@adyen/adyen-web/dist/types/core/ProcessResponse/PaymentMethodsResponse/types';
import Core from '@adyen/adyen-web/dist/types/core';
import { handleAdditionalDetails, handleChange, handleError, handleSubmit } from './checkout-handlers';

type Props = {
    showPayButton: boolean;
    paymentMethodsConfiguration?: Record<string, object>;
};

async function createAdvancedFlowCheckout({ showPayButton, paymentMethodsConfiguration }: Props): Promise<Core> {
    const paymentMethodsResponse: PaymentMethodsResponseObject = await getPaymentMethods();

    const checkout = await AdyenCheckout({
        clientKey: process.env.CLIENT_KEY,
        environment: process.env.CLIENT_ENV,
        amount,
        countryCode,
        paymentMethodsResponse,
        locale: shopperLocale,
        showPayButton,
        paymentMethodsConfiguration,

        onSubmit: async (state, component) => {
            await handleSubmit(state, component, checkout);
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
            resolve(await createOrder(amount));
        },

        onOrderCancel: async order => {
            await cancelOrder(order);
            await checkout.update({
                paymentMethodsResponse: await getPaymentMethods({ amount, shopperLocale }),
                order: null,
                amount
            });
        },

        onError: (error, component) => {
            handleError(error, component);
        }
    });

    return checkout;
}

export { createAdvancedFlowCheckout };
