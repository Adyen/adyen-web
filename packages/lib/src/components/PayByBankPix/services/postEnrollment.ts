import { httpPost } from '../../../core/Services/http';
import { RawPaymentResponse } from '../../../types/global-types';

interface PostEnrollment {
    enrollmentId: string;
    clientKey: string;
    loadingContext: string;
    timeout?: number; // in milliseconds
}

async function postEnrollment({ enrollmentId, clientKey, loadingContext, timeout = 10000 }: PostEnrollment): Promise<RawPaymentResponse> {
    if (!enrollmentId || !clientKey) {
        throw new Error('Could not check the enrollment status');
    }
    const options = {
        loadingContext,
        path: ``, //todo add it when BE is ready
        timeout
    };

    return httpPost(options);
}

export { postEnrollment };
