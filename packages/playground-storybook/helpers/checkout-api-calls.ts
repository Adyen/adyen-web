import paymentMethodsConfig from '../config/paymentMethodsConfig';
import paymentsConfig from '../config/paymentsConfig';
import { httpPost } from '../utils/http-post';
import { PaymentMethodsResponseObject } from '@adyen/adyen-web/dist/types/core/ProcessResponse/PaymentMethodsResponse/types';
import { RawPaymentResponse } from '@adyen/adyen-web/dist/types/components/types';
import { CheckoutSessionSetupResponse, Order, OrderStatus, PaymentAction, PaymentAmount } from '@adyen/adyen-web/dist/types/types';

export const getPaymentMethods = async (configuration?: any): Promise<PaymentMethodsResponseObject> =>
    await httpPost('paymentMethods', { ...paymentMethodsConfig, ...configuration });

export const makePayment = async (stateData: any): Promise<RawPaymentResponse> => {
    const paymentRequest = { ...paymentsConfig, ...stateData };
    if (paymentRequest.order) delete paymentRequest.amount; // why?
    return await httpPost('payments', paymentRequest);
};

export const makeDetailsCall = async (detailsData: {
    details: { redirectResult: string };
}): Promise<{ resultCode: string; action?: PaymentAction }> => await httpPost('details', detailsData);

export const createSession = async (data: any): Promise<CheckoutSessionSetupResponse> => {
    return await httpPost('sessions', { ...data, lineItems: paymentsConfig.lineItems });
};

export const checkBalance = async (
    giftcardStateData: any
): Promise<{
    pspReference: string;
    resultCode: string;
    balance: {
        currency: string;
        value: number;
    };
}> => await httpPost('paymentMethods/balance', giftcardStateData);

export const createOrder = async (amount: PaymentAmount): Promise<Order & OrderStatus> =>
    await httpPost('orders', { reference: `order-reference-${Date.now()}`, amount });

export const cancelOrder = async (order: Order): Promise<{ resultCode: string; pspReference: string }> => await httpPost('orders/cancel', order);
