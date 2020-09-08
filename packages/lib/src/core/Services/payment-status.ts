import { FALLBACK_CONTEXT } from '../config';

/**
 * Submits data to Adyen
 * @param initiationUrl - Url where to make the callbacks
 * @param data - ready to be serialized and included in the body of request
 * @returns a promise containing the response of the call
 */
const getStatus = (initiationUrl, data) => {
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    return fetch(initiationUrl, options)
        .then(response => response.json())
        .catch(error => {
            throw error;
        });
};

/**
 * Submits data to Adyen
 * @param paymentData -
 * @param accessKey -
 * @param loadingContext -
 * @returns a promise containing the response of the call
 */
export const checkPaymentStatus = (paymentData, accessKey, loadingContext) => {
    if (!paymentData || !accessKey) {
        throw new Error('Could not check the payment status');
    }

    const statusUrl = `${loadingContext || FALLBACK_CONTEXT}services/PaymentInitiation/v1/status?token=${accessKey}`;

    return getStatus(statusUrl, { paymentData });
};

export default {
    checkPaymentStatus
};
