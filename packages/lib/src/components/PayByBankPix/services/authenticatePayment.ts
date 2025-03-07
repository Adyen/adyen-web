import { httpPost } from '../../../core/Services/http';
import { RawPaymentResponse } from '../../../types/global-types';

interface IAuthenticatePayment {
    authCredentials: string;
    clientKey: string;
    loadingContext: string;
    timeout?: number; // in milliseconds
}

async function authenticatePayment({
    authCredentials,
    clientKey,
    loadingContext,
    timeout = 10000
}: IAuthenticatePayment): Promise<RawPaymentResponse> {
    if (!authCredentials || !clientKey) {
        throw new Error('Could not check the enrollment status');
    }
    const options = {
        loadingContext,
        path: `${clientKey}`,
        timeout
    };

    return httpPost(options, authCredentials);
}

export { authenticatePayment };
