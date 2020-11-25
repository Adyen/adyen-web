import { httpPost } from './http';

/**
 * Calls the payment status endpoint
 * @param paymentData -
 * @param clientKey -
 * @param loadingContext -
 * @returns a promise containing the response of the call
 */
export default function checkPaymentStatus(paymentData, clientKey, loadingContext) {
    if (!paymentData || !clientKey) {
        throw new Error('Could not check the payment status');
    }

    const options = {
        clientKey,
        loadingContext,
        path: 'services/PaymentInitiation/v1/status'
    };

    return httpPost(options, { paymentData });
}
