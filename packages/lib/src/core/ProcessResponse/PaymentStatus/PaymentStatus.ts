import { ProcessedPaymentStatusResponse, RawPaymentStatusResponse } from '../../../types/global-types';

/**
 * Processes a complete response from Adyen by resultCode
 * @param response - to be processed
 * @returns a new object describing the response result (ready for onStatusChange)
 */
const processPaymentStatusCompleteResponse = (response: RawPaymentStatusResponse): ProcessedPaymentStatusResponse => {
    switch (response.resultCode.toLowerCase()) {
        case 'refused':
        case 'error':
        case 'cancelled':
            return { type: 'error', props: { ...response, message: 'error.subtitle.refused' } };
        case 'unknown':
            return { type: 'error', props: { ...response, message: 'error.message.unknown' } };
        case 'pending':
        case 'received':
            return { type: response.resultCode.toLowerCase(), props: response };
        case 'authorised':
            return { type: 'success', props: response };
        default:
            return { type: 'success', props: response };
    }
};

/**
 * Processes a response from Adyen by type
 * @param response - to be processed
 * @returns a new object describing the response result (ready for onStatusChange)
 */
export const processPaymentStatusResponse = (response: RawPaymentStatusResponse): ProcessedPaymentStatusResponse => {
    if (!response.type && response.resultCode) {
        return processPaymentStatusCompleteResponse(response);
    }

    if (!response.type) {
        return { type: 'error', props: response };
    }

    switch (response.type.toLowerCase()) {
        case 'pending':
            return { type: 'pending', props: response };
        case 'complete':
            return processPaymentStatusCompleteResponse(response);
        case 'validation':
            return { type: 'error', props: response };
        default:
            return { type: 'error', props: response };
    }
};
