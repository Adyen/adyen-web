import { httpPost } from '../../../core/Services/http';
import { RawPaymentResponse } from '../../../types/global-types';

interface IPostEnrollment {
    enrollment: { enrollmentId: string; fidoAssertion: string };
    clientKey: string;
    loadingContext: string;
    timeout?: number; // in milliseconds
}

async function authorizeEnrollment({ enrollment, clientKey, loadingContext, timeout = 10000 }: IPostEnrollment): Promise<RawPaymentResponse> {
    if (!enrollment || !clientKey) {
        throw new Error('Could not authorize the enrollment');
    }
    const options = {
        loadingContext,
        path: `utility/v1/pixpaybybank/redirect-result?clientKey=${clientKey}`,
        timeout
    };

    return httpPost(options, enrollment);
}

export { authorizeEnrollment };
