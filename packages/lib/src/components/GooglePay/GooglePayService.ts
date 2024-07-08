import { isReadyToPayRequest, initiatePaymentRequest } from './requests';
import { resolveEnvironment } from './utils';
import Script from '../../utils/Script';
import config from './config';
import type { GooglePayConfiguration } from './types';

class GooglePayService {
    public readonly paymentsClient: Promise<google.payments.api.PaymentsClient>;

    constructor(environment: string, paymentDataCallbacks: google.payments.api.PaymentDataCallbacks) {
        const googlePayEnvironment = resolveEnvironment(environment);

        this.paymentsClient = this.getGooglePaymentsClient({
            environment: googlePayEnvironment,
            paymentDataCallbacks
        });
    }

    /**
     * Initialize a Google Pay API client
     *
     * @see {@link https://developers.google.com/pay/api/web/reference/client#PaymentsClient|PaymentsClient constructor}
     * @returns Google Pay API client
     */
    async getGooglePaymentsClient(paymentOptions: google.payments.api.PaymentOptions): Promise<google.payments.api.PaymentsClient> {
        if (!window.google?.payments) {
            const script = new Script(config.URL);
            await script.load();
        }

        return new google.payments.api.PaymentsClient(paymentOptions);
    }

    /**
     * Determine a shopper's ability to return a form of payment from the Google Pay API.
     * @see {@link https://developers.google.com/pay/api/web/reference/client#isReadyToPay|isReadyToPay}
     */
    isReadyToPay(props): Promise<google.payments.api.IsReadyToPayResponse> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (!this.paymentsClient) return Promise.reject(new Error('Google Pay is not available'));

        return this.paymentsClient.then(client => client.isReadyToPay(isReadyToPayRequest(props)));
    }

    prefetchPaymentData(props: GooglePayConfiguration, countryCode: string): void {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (!this.paymentsClient) throw new Error('Google Pay is not available');

        const paymentDataRequest = initiatePaymentRequest(props, countryCode);
        void this.paymentsClient.then(client => client.prefetchPaymentData(paymentDataRequest));
    }

    /**
     * Show Google Pay payment sheet when Google Pay payment button is clicked
     * @returns paymentData response from Google Pay API after user approves payment
     * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentData|PaymentData object reference}
     */
    initiatePayment(props: GooglePayConfiguration, countryCode: string): Promise<google.payments.api.PaymentData> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (!this.paymentsClient) throw new Error('Google Pay is not available');

        const paymentDataRequest = initiatePaymentRequest(props, countryCode);
        return this.paymentsClient.then(client => client.loadPaymentData(paymentDataRequest));
    }
}

export default GooglePayService;
