import Script from '../../../utils/Script';
import { PaymentDataRequest } from '../models/PaymentDataRequest';

export type AcceleratedCheckoutOptions = {
    environment: google.payments.api.Environment;
    paymentDataCallbacks: google.payments.api.PaymentDataCallbacks;
    checkoutRequest: PaymentDataRequest;
    acceleratedCheckoutConfig: {
        type: 'INLINE';
        containerId: string;
    };
};

class GooglePayAcceleratedService {
    public readonly paymentsClientPromise: Promise<google.payments.api.AcceleratedCheckoutClient>;

    constructor(acceleratedCheckoutOptions: AcceleratedCheckoutOptions, script: Script) {
        console.log('[Adyen] AcceleratedCheckoutOptions', acceleratedCheckoutOptions);
        this.paymentsClientPromise = this.getGoogleAccelerateCheckoutClient(acceleratedCheckoutOptions, script);

        this.paymentsClientPromise
            .then(client => {
                console.log('[Adyen] GAC client', client);
            })
            .catch(error => {
                console.error('[Adyen] GAC error', error);
            });
    }

    /**
     * Initialize a Google Pay Accelerated Checkout client
     *
     * @returns Google Pay Accelerated Checkout client
     */
    async getGoogleAccelerateCheckoutClient(
        acceleratedCheckoutOptions: AcceleratedCheckoutOptions,
        script: Script
    ): Promise<google.payments.api.AcceleratedCheckoutClient> {
        if (!window.google?.payments?.api?.AcceleratedCheckoutClient) {
            await script.load();
        }

        return new google.payments.api.AcceleratedCheckoutClient(acceleratedCheckoutOptions);
    }
}

export default GooglePayAcceleratedService;
