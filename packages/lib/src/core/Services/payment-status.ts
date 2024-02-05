import { httpPost } from './http';

/**
 * Calls the payment status endpoint
 * @param paymentData -
 * @param clientKey -
 * @param loadingContext -
 * @param timeout - in milliseconds
 * @returns a promise containing the response of the call
 */
export default function checkPaymentStatus(paymentData, clientKey, loadingContext, timeout) {
    if (!paymentData || !clientKey) {
        throw new Error('Could not check the payment status');
    }

    const options = {
        loadingContext,
        path: `services/PaymentInitiation/v1/status?clientKey=${clientKey}`,
        timeout
    };

    return httpPost(options, { paymentData });
}
