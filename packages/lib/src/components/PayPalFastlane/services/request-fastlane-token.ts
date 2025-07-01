import { httpPost } from '../../../core/Services/http';

export interface FastlaneTokenData {
    id: string;
    clientId: string;
    value: string;
    expiresAt: string;
    merchantId: string;
}

function requestFastlaneToken(url: string, clientKey: string): Promise<FastlaneTokenData> {
    const path = `utility/v1/payPalFastlane/tokens?clientKey=${clientKey}`;
    return httpPost<FastlaneTokenData>({ loadingContext: url, path, errorLevel: 'fatal' });
}

export default requestFastlaneToken;
