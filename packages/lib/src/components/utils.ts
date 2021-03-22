import { PaymentResponse, RawPaymentResponse } from './types';

const ALLOWED_PROPERTIES = ['action', 'resultCode', 'sessionData'];

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

    if (removedProperties.length) console.warn(`These properties should not be passed to the frontend: ${removedProperties.join(', ')}`);

    return sanitizedObject as PaymentResponse;
}
