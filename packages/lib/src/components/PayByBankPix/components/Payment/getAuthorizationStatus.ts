import { httpGet } from '../../../../core/Services/http';
import { RawPaymentResponse } from '../../../../types/global-types';

interface IGetAuthorizationStatus {
    enrollmentId: string;
    initiationId: string;
    clientKey: string;
    loadingContext: string;
    timeout?: number; // in milliseconds
}

export default async function getAuthorizationStatus({
    enrollmentId,
    initiationId,
    clientKey,
    loadingContext,
    timeout = 10000
}: IGetAuthorizationStatus): Promise<RawPaymentResponse> {
    if (!enrollmentId || !initiationId || !clientKey) {
        throw new Error('Could not get auth options');
    }

    const options = {
        loadingContext,
        path: `utility/v1/pixpaybybank/authorization-options?initiationId=${initiationId}&enrollmentId=${enrollmentId}&clientKey=${clientKey}`,
        timeout
    };

    return httpGet(options);
}
