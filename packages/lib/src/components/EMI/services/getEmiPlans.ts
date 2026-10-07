import { httpPost } from '../../../core/Services/http';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { EMI_PLANS_PATH } from '../constants';
import type { EmiPlansResponse } from '../types';

interface GetEmiPlansOptions {
    /** Absent when the payment methods entry carries none. Still sent, as `{}`, so the backend records the misconfiguration. */
    emiToken?: string;
    clientKey?: string;
    loadingContext?: string;
    timeout: number;
}

/**
 * Looks up the installment plans the `emiToken` of the payment methods response entitles the shopper to.
 *
 * `errorLevel: 'fatal'` makes every failure reject, keeping the response body in `error.options.cause`, so the
 * caller can tell a token error from a failed request. Any other level resolves `undefined` on failure, which
 * would read as "no plans".
 */
export async function getEmiPlans({ emiToken, clientKey, loadingContext, timeout }: GetEmiPlansOptions): Promise<EmiPlansResponse> {
    if (!clientKey) {
        throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'EMI: A clientKey is required to request the installment plans');
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
