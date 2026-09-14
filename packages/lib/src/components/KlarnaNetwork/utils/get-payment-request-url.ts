import type { RawPaymentResponse } from '../../../types/global-types';

/**
 * A Klarna Network step-up arrives as a regular Adyen redirect action. Klarna's `initiate` callback
 * takes over the journey when it is handed back the URL, so the action is not passed to
 * handleAction in that case.
 */
export function getPaymentRequestUrl(response?: Partial<RawPaymentResponse>): string | undefined {
    const action = response?.action;
    if (action?.type !== 'redirect') return undefined;
    return action.url;
}
