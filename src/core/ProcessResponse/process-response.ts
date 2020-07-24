import { PaymentResponse, ProcessedResponse } from '../../types';
import useCoreContext from '../Context/useCoreContext';

/**
 * Processes a complete response from Adyen by resultCode
 * @param response - to be processed
 * @returns a new object describing the response result (ready for onStatusChange)
 */
const processCompleteResponse = (response: PaymentResponse): ProcessedResponse => {
    const { i18n } = useCoreContext();

    switch (response.resultCode.toLowerCase()) {
        case 'refused':
        case 'error':
        case 'cancelled':
            return { type: 'error', props: { ...response, message: i18n.get('error.subtitle.refused') } };
        case 'unknown':
            return { type: 'error', props: { ...response, message: i18n.get('error.message.unknown') } };
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
export const processResponse = (response: PaymentResponse): ProcessedResponse => {
    if (!response.type && response.resultCode) {
        return processCompleteResponse(response);
    }

    if (!response.type) {
        return { type: 'error', props: response };
    }

    switch (response.type.toLowerCase()) {
        case 'pending':
            return { type: 'pending', props: response };
        case 'complete':
            return processCompleteResponse(response);
        case 'validation':
            return { type: 'error', props: response };
        default:
            return { type: 'error', props: response };
    }
};

export default processResponse;
