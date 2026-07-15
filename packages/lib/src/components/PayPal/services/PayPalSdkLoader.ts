import { IAnalytics } from '../../../core/Analytics/Analytics';
import { AdyenCheckoutError } from '../../../types';
import Script from '../../../utils/Script';
import { PAYPAL_SDK_URL_PRODUCTION, PAYPAL_SDK_URL_SANDBOX } from '../config';

class PayPalSdkLoader {
    private sdkLoadingPromise: Promise<void>;
    private readonly analytics: IAnalytics;
    private readonly environment: string;
    private readonly nonce?: string;

    constructor({ analytics, environment, nonce }: { analytics: IAnalytics; environment: string; nonce?: string }) {
        this.analytics = analytics;
        this.environment = environment;
        this.nonce = nonce;
    }

    public async load(): Promise<typeof window.paypal> {
        try {
            const scriptElement = new Script({
                src: this.environment.toLowerCase() === 'test' ? PAYPAL_SDK_URL_SANDBOX : PAYPAL_SDK_URL_PRODUCTION,
                component: 'paypal',
                attributes: { crossOrigin: 'anonymous', ...(this.nonce ? { nonce: this.nonce } : {}) },
                analytics: this.analytics
            });

            this.sdkLoadingPromise = scriptElement.load();
            await this.sdkLoadingPromise;

            return window?.paypal;
        } catch (error) {
            throw new AdyenCheckoutError('SCRIPT_ERROR', 'PayPal SDK failed to load', { cause: error });
        }
    }

    public isSdkLoaded(): Promise<void> {
        if (this.sdkLoadingPromise === undefined) {
            return Promise.reject(new Error('PayPal SDK not loaded'));
        }

        return this.sdkLoadingPromise;
    }
}

export { PayPalSdkLoader };
