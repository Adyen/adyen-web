import { httpGet } from '../../../../core/Services/http';
import { RawPaymentResponse } from '../../../../types/global-types';

interface IGetEnrollmentStatus {
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
}: IGetEnrollmentStatus): Promise<RawPaymentResponse> {
    if (!enrollmentId || !clientKey) {
        throw new Error('Could not check the enrollment status');
    }
    const options = {
        loadingContext,
        path: `utility/v1/pixpaybybank/registration-options/${enrollmentId}?clientKey=${clientKey}`,
        timeout
    };

    return httpGet(options);
}
