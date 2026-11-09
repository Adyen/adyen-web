import { httpPost } from '../../../core/Services/http';

export interface PayPalOauthTokenData {
    requestId: string;
    clientId: string;
    clientToken: string;
    expiresAt: string;
    merchantId: string;
}

function requestPayPalOauthToken(url: string, { clientKey, merchantId }: { clientKey: string; merchantId?: string }): Promise<PayPalOauthTokenData> {
    const path = `utility/v1/payPal/token?clientKey=${clientKey}`;
    return httpPost<PayPalOauthTokenData>({ loadingContext: url, path, errorLevel: 'fatal' }, { merchantId });
}

export default requestPayPalOauthToken;
