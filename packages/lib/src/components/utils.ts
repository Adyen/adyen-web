import {PaymentResponse, RawPaymentResponse, UIElementStatus} from './types';

const ALLOWED_PROPERTIES = ['action', 'resultCode', 'sessionData', 'order'];

export function getSanitizedResponse(response: RawPaymentResponse): PaymentResponse {
    const removedProperties = [];

    const sanitizedObject = Object.keys(response).reduce((acc, cur) => {
        if (!ALLOWED_PROPERTIES.includes(cur)) {
            removedProperties.push(cur);
        } else {
            acc[cur] = response[cur];
        }
        return acc;
    }, {});

    if (removedProperties.length) console.warn(`The following properties should not be passed to the client: ${removedProperties.join(', ')}`);

    return sanitizedObject as PaymentResponse;
}

export function resolveFinalResult(result: PaymentResponse): [status: UIElementStatus, statusProps?: any] {
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
