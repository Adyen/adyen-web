import { UIElementStatus } from './types';
import { RawPaymentResponse, PaymentResponseData } from '../../../types/global-types';

const ALLOWED_PROPERTIES = ['action', 'resultCode', 'sessionData', 'order', 'sessionResult', 'donationToken'];

export function getSanitizedResponse(response: RawPaymentResponse): PaymentResponseData {
    const removedProperties = [];

    const sanitizedObject = Object.keys(response).reduce((acc, cur) => {
        if (!ALLOWED_PROPERTIES.includes(cur)) {
            removedProperties.push(cur);
        } else {
            acc[cur] = response[cur];
        }
        return acc;
    }, {});

    if (removedProperties.length)
        console.warn(`The following properties should not be passed to the client: ${removedProperties.join(', ')}`);

    return sanitizedObject as PaymentResponseData;
}

export function resolveFinalResult(result: PaymentResponseData): [status: UIElementStatus, statusProps?: any] {
    switch (result.resultCode) {
        case 'Authorised':
        case 'Received':
            return ['success'];
        case 'Pending':
            return ['success'];
        case 'Cancelled':
        case 'Error':
        case 'Refused':
            return ['error'];
        default:
    }
}
