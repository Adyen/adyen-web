import { httpPost } from '../../../core/Services/http';
import { RawPaymentResponse } from '../../../types/global-types';
import { Enrollment } from '../components/PayByBankPix/types';

interface PostEnrollment {
    enrollment: Enrollment;
    clientKey: string;
    loadingContext: string;
    timeout?: number; // in milliseconds
}

async function postEnrollment({ enrollment, clientKey, loadingContext, timeout = 10000 }: PostEnrollment): Promise<RawPaymentResponse> {
    if (!enrollment || !clientKey) {
        throw new Error('Could not check the enrollment status');
    }
    const options = {
        loadingContext,
        path: `utility/v1/pixpaybybank/redirect-result?clientKey=${clientKey}`,
        timeout
    };

    return httpPost(options, enrollment);
}

export { postEnrollment };
