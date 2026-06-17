import Script from '../../../utils/Script';
import { PaymentDataRequest } from '../models/PaymentDataRequest';

interface IGoogleAcceleratedCheckoutClient {
    isAvailable(): Promise<{ status?: 'SUCCESS' }>;
    load(): Promise<{ status: 'SUCCESS' | 'ERROR' }>;
}

export type AcceleratedCheckoutOptions = {
    environment: google.payments.api.Environment;
    paymentDataCallbacks: google.payments.api.PaymentDataCallbacks;
    checkoutRequest: PaymentDataRequest;
    acceleratedCheckoutConfig: {
        type: 'INLINE';
        containerId: string;
    };
};

class GoogleAcceleratedCheckoutClient implements IGoogleAcceleratedCheckoutClient {
    private readonly clientPromise: Promise<google.payments.api.AcceleratedCheckoutClient>;

    constructor(acceleratedCheckoutOptions: AcceleratedCheckoutOptions, script: Script) {
        this.clientPromise = this.getAcceleratedCheckoutClient(acceleratedCheckoutOptions, script);
    }

    /**
     * Initialize a Google Pay Accelerated Checkout client
     *
     * @returns Google Pay Accelerated Checkout client wrapped in a Promise
     */
    private async getAcceleratedCheckoutClient(
        acceleratedCheckoutOptions: AcceleratedCheckoutOptions,
        script: Script
    ): Promise<google.payments.api.AcceleratedCheckoutClient> {
        if (!globalThis.google?.payments?.api?.AcceleratedCheckoutClient) {
            await script.load();
        }

        return new google.payments.api.AcceleratedCheckoutClient(acceleratedCheckoutOptions);
    }

    /**
     * Determines whether user is eligible for accelerated checkout. Returns an error if the user is ineligible
     */
    public async isAvailable(): Promise<{ status?: 'SUCCESS' }> {
        return this.clientPromise.then(client => client.isAvailable());
    }

    /**
     * Initiates the accelerated checkout session in the target iframe. Returns an unavailable status
     * if the user is ineligible for accelerated checkout.
     */
    public async load(): Promise<{ status: 'SUCCESS' | 'ERROR' }> {
        return this.clientPromise.then(client => client.load());
    }
}

export default GoogleAcceleratedCheckoutClient;
