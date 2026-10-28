import { httpPost } from '../../../core/Services/http';
import AdyenCheckoutError, { IMPLEMENTATION_ERROR } from '../../../core/Errors/AdyenCheckoutError';
import { EMI_MISSING_CLIENT_KEY_MESSAGE, EMI_PLANS_PATH } from '../constants';
import type { EmiPlansResponse } from '../types';

interface GetEmiPlansOptions {
    emiToken?: string;
    clientKey?: string;
    loadingContext?: string;
    timeout: number;
}

export async function getEmiPlans({ emiToken, clientKey, loadingContext, timeout }: GetEmiPlansOptions): Promise<EmiPlansResponse> {
    if (!clientKey) {
        throw new AdyenCheckoutError(IMPLEMENTATION_ERROR, EMI_MISSING_CLIENT_KEY_MESSAGE);
    }

    return httpPost<EmiPlansResponse>(
        {
            loadingContext,
            path: `${EMI_PLANS_PATH}?clientKey=${clientKey}`,
            timeout,
            errorLevel: 'fatal'
        },
        { emiToken }
    );
}
