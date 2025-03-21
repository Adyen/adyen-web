import { httpPost } from '../../../core/Services/http';
import { RawPaymentResponse } from '../../../types/global-types';
import { RiskSignalsAuthentication } from './types';

interface IAuthorizePayment {
    payment: { enrollmentId: string; initiationId: string; fidoAssertion: string; riskSignals: RiskSignalsAuthentication };
    clientKey: string;
    loadingContext: string;
    timeout?: number; // in milliseconds
}

async function authorizePayment({ payment, clientKey, loadingContext, timeout = 10000 }: IAuthorizePayment): Promise<RawPaymentResponse> {
    if (!payment || !clientKey) {
        throw new Error('Could not authorize the payment');
    }
    const options = {
        loadingContext,
        path: `utility/v1/pixpaybybank/redirect-result?clientKey=${clientKey}`,
        timeout
    };

    return httpPost(options, payment);
}

export { authorizePayment };
