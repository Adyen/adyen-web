import Script from '../../../utils/Script';
import { PaymentDataRequest } from '../models/PaymentDataRequest';

export interface IGoogleAcceleratedCheckoutClient {
    isAvailable(): Promise<AcceleratedCheckoutResult>;
    load(): Promise<AcceleratedCheckoutResult>;
    onPaymentSheetResize(callback: (resize: PaymentSheetResize) => void): () => void;
}

type AcceleratedCheckoutResult = { status: 'SUCCESS' | 'ERROR'; errorMessage?: string };

export type PaymentSheetResize = { height: number; heightCss: string };

export type AcceleratedCheckoutOptions = {
    environment: google.payments.api.Environment;
    paymentDataCallbacks: google.payments.api.PaymentDataCallbacks;
    checkoutUiCallbacks?: {
        onPaymentSheetResized?(resizeSize: PaymentSheetResize): void;
    };
    checkoutRequest: PaymentDataRequest;
    acceleratedCheckoutConfig: {
        type: 'INLINE';
        containerId: string;
    };
};

class GoogleAcceleratedCheckoutClient implements IGoogleAcceleratedCheckoutClient {
    private readonly clientPromise: Promise<google.payments.api.AcceleratedCheckoutClient>;

    /**
     *  Last dimensions reported by the Google payment sheet resize callback
     */
    private lastResize: PaymentSheetResize | null = null;

    /**
     * Subscriber notified whenever the payment sheet is resized
     */
    private resizeSubscriber: ((resize: PaymentSheetResize) => void) | null = null;

    constructor(acceleratedCheckoutOptions: AcceleratedCheckoutOptions, script: Script) {
        const options: AcceleratedCheckoutOptions = {
            ...acceleratedCheckoutOptions,
            checkoutUiCallbacks: {
                onPaymentSheetResized: this.handlePaymentSheetResized
            }
        };

        this.clientPromise = this.getAcceleratedCheckoutClient(options, script);
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

    private readonly handlePaymentSheetResized = (resize: PaymentSheetResize): void => {
        this.lastResize = resize;
        this.resizeSubscriber?.(resize);
    };

    /**
     * Subscribe to payment sheet resize events. The callback is invoked immediately with the last emitted
     * value (if any) so late subscribers are not left with stale dimensions.
     *
     * @param callback - Invoked with the new dimensions whenever the payment sheet is resized
     * @returns Unsubscribe function
     */
    public onPaymentSheetResize(callback: (resize: PaymentSheetResize) => void): () => void {
        this.resizeSubscriber = callback;

        if (this.lastResize) {
            callback(this.lastResize);
        }

        return () => {
            this.resizeSubscriber = null;
        };
    }

    /**
     * Determines whether user is eligible for accelerated checkout. Returns an error if the user is ineligible
     */
    public async isAvailable(): Promise<AcceleratedCheckoutResult> {
        return this.clientPromise.then(client => client.isAvailable());
    }

    /**
     * Initiates the accelerated checkout session in the target iframe. Returns an unavailable status
     * if the user is ineligible for accelerated checkout.
     */
    public async load(): Promise<AcceleratedCheckoutResult> {
        return this.clientPromise.then(client => client.load());
    }
}

export default GoogleAcceleratedCheckoutClient;
