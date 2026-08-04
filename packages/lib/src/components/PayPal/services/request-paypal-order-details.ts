import { httpPost } from '../../../core/Services/http';

export type PayPalOrderDetailsData = {
    requestId: string;
    shopperName: {
        firstName: string;
        lastName: string;
    };
    billingAddress: {
        street: string;
        houseNumberOrName: string;
        city: string;
        postalCode: string;
        stateOrProvince: string;
        country: string;
    };
    deliveryAddress: {
        street: string;
        houseNumberOrName: string;
        city: string;
        postalCode: string;
        stateOrProvince: string;
        country: string;
        firstName: string;
    };
    payPalOrder: Record<string, unknown>;
};

function requestPayPalOrderDetails(
    url: string,
    { clientKey, merchantId, orderId }: { clientKey: string; merchantId?: string; orderId?: string }
): Promise<PayPalOrderDetailsData> {
    const path = `utility/v1/payPal/${merchantId}/orders/${orderId}?clientKey=${clientKey}`;
    return httpPost<PayPalOrderDetailsData>({ loadingContext: url, path, errorLevel: 'fatal' }, { merchantId });
}

export default requestPayPalOrderDetails;
