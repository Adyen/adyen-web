import { httpGet } from '../../../../core/Services/http';
import { RawPaymentResponse } from '../../../../types/global-types';

interface EnrollmentStatus {
    enrollmentId: string;
    clientKey: string;
    loadingContext: string;
    timeout?: number; // in milliseconds
}

export default async function getEnrollmentStatus({
    enrollmentId,
    clientKey,
    loadingContext,
    timeout = 10000
}: EnrollmentStatus): Promise<RawPaymentResponse> {
    if (!enrollmentId || !clientKey) {
        throw new Error('Could not check the enrollment status');
    }
    //https://checkoutshopper-test.adyen.com/checkoutshopper/services/registration-option/{enrollmentId}?clientKey=xxxxxxx
    const options = {
        loadingContext,
        path: `services/registration-option/${enrollmentId}?clientKey=${clientKey}`,
        timeout
    };

    return httpGet(options);
}
