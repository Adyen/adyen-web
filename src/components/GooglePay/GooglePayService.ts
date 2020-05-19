import { isReadyToPayRequest, initiatePaymentRequest } from './requests';
import { resolveEnvironment } from './utils';

class GooglePayService {
    public readonly paymentsClient: google.payments.api.PaymentsClient;

    constructor(environment) {
        const env = resolveEnvironment(environment);
        if (env === 'TEST') {
            console.warn('Google Pay initiated in TEST mode. Request non-chargeable payment methods suitable for testing.');
        }
        this.paymentsClient = this.getGooglePaymentsClient(env);
    }

    /**
     * Initialize a Google Pay API client
     *
     * @see {@link https://developers.google.com/pay/api/web/reference/client#PaymentsClient|PaymentsClient constructor}
     * @returns {google.payments.api.PaymentsClient} Google Pay API client
     */
    getGooglePaymentsClient(environment) {
        if (window.google && window.google.payments) {
            return new google.payments.api.PaymentsClient({ environment });
        }

        return null;
    }

    /**
     * Determine a shopper's ability to return a form of payment from the Google Pay API.
     * @see {@link https://developers.google.com/pay/api/web/reference/client#isReadyToPay|isReadyToPay}
     */
    isReadyToPay(props): Promise<google.payments.api.IsReadyToPayResponse> {
        if (!this.paymentsClient) return Promise.reject(new Error('Google Pay is not available'));

        return this.paymentsClient.isReadyToPay(isReadyToPayRequest(props));
    }

    prefetchPaymentData(props): void {
        if (!this.paymentsClient) throw new Error('Google Pay is not available');

        const paymentDataRequest = initiatePaymentRequest(props);
        return this.paymentsClient.prefetchPaymentData(paymentDataRequest);
    }

    /**
     * Show Google Pay payment sheet when Google Pay payment button is clicked
     * @returns paymentData response from Google Pay API after user approves payment
     * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentData|PaymentData object reference}
     */
    initiatePayment(props): Promise<google.payments.api.PaymentData> {
        if (!this.paymentsClient) throw new Error('Google Pay is not available');

        const paymentDataRequest = initiatePaymentRequest(props);
        return this.paymentsClient.loadPaymentData(paymentDataRequest);
    }
}

export default GooglePayService;
