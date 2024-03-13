import paymentMethodsConfig from '../config/paymentMethodsConfig';
import paymentsConfig from '../config/paymentsConfig';
import { httpPost } from '../utils/http-post';
import type {
    Order,
    OrderStatus,
    PaymentAction,
    PaymentAmount,
    PaymentMethodsResponse,
    RawPaymentResponse,
    AdditionalDetailsStateData,
    ResultCode
} from '../../src/types';
import type { CheckoutSessionSetupResponse } from '../../src/core/CheckoutSession/types';
import { DonationAmount, DonationComponentProps } from '../../src/components/Donation/components/types';

type DonationCampaign = Omit<DonationComponentProps, 'onDonate' | 'onCancel'> & { id: string };

interface DonationResponse {
    donationCampaigns: Array<DonationCampaign>;
}

type DonationRequest = {
    donationCampaignId: string;
    amount: DonationAmount;
    reference: string;
    paymentMethod: { type: 'scheme' | 'sepadirectdebit' };
    donationToken: string;
    donationOriginalPspReference: string;
    donationAccount?: string;
    returnUrl?: string;
    merchantAccount: string;
};

export const getPaymentMethods = async (configuration?: any): Promise<PaymentMethodsResponse> =>
    await httpPost('paymentMethods', { ...paymentMethodsConfig, ...configuration });

export const makePayment = async (stateData: any, paymentData: any): Promise<RawPaymentResponse> => {
    const paymentRequest = { ...paymentsConfig, ...stateData, ...paymentData };
    if (paymentRequest.order) delete paymentRequest.amount; // why?
    return await httpPost('payments', paymentRequest);
};

export const makeDetailsCall = async (
    detailsData: AdditionalDetailsStateData['data']
): Promise<{
    resultCode: ResultCode;
    action?: PaymentAction;
    order?: Order;
    donationToken?: string;
    pspReference?: string;
    merchantReference?: string;
    paymentMethod?: any;
}> => await httpPost('details', detailsData);

export const createSession = async (data: any): Promise<CheckoutSessionSetupResponse> => {
    return await httpPost('sessions', { ...data, lineItems: paymentsConfig.lineItems });
};

export const patchPaypalOrder = async ({
    sessionId,
    pspReference,
    paymentData,
    amount,
    deliveryMethods
}: {
    sessionId?: string;
    pspReference?: string;
    paymentData: string;
    amount: { value: number; currency: string };
    deliveryMethods?: any;
}): Promise<{ paymentData: string }> => {
    if (!(pspReference || sessionId) || !paymentData || !amount.value || !amount.currency) {
        throw Error('PayPal patching order - Field is missing');
    }

    const response = await httpPost('paypal/updateOrder', {
        ...(sessionId && { sessionId }),
        ...(pspReference && { pspReference }),
        ...(deliveryMethods && { deliveryMethods }),
        paymentData,
        amount
    });

    // @ts-ignore Error from API
    if (response.errorCode) {
        throw Error('Patch failed');
    }

    return response as { paymentData: string };
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

export const getDonationCampaigns = async (request: { currency: string }): Promise<DonationResponse> => await httpPost('donationCampaigns', request);

export const createDonation = async (request: DonationRequest): Promise<any> => await httpPost('donations', request);
