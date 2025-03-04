import { httpGet } from '../../../../core/Services/http';
import { RawPaymentResponse } from '../../../../types/global-types';

interface AuthOptions {
    enrollmentId: string;
    initiationId: string;
    clientKey: string;
    loadingContext: string;
    timeout?: number; // in milliseconds
}

export default async function getAuthOptions({
    enrollmentId,
    initiationId,
    clientKey,
    loadingContext,
    timeout = 10000
}: AuthOptions): Promise<RawPaymentResponse> {
    if (!enrollmentId || !initiationId || !clientKey) {
        throw new Error('Could not get auth options');
    }
    const options = {
        loadingContext,
        path: `/${enrollmentId}${initiationId}?clientKey=${clientKey}`, //todo: get the endpoint
        timeout
    };

    return httpGet(options);
}
