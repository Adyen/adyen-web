import { IAnalytics } from '../../core/Analytics/Analytics';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import Script from '../../utils/Script';

const PAYPAL_SDK_URL = 'https://www.sandbox.paypal.com/web-sdk/v6/core';

class PayPalSdkLoader {
    private sdkLoadingPromise: Promise<void>;
    private readonly analytics: IAnalytics;

    constructor({ analytics }: { analytics: IAnalytics }) {
        this.analytics = analytics;
    }

    public async load(): Promise<any> {
        try {
            const scriptElement = new Script({
                src: PAYPAL_SDK_URL,
                component: 'paypal',
                attributes: { crossOrigin: 'anonymous' },
                analytics: this.analytics
            });

            this.sdkLoadingPromise = scriptElement.load();
            await this.sdkLoadingPromise;

            return window?.ApplePaySession;
        } catch (error) {
            throw new AdyenCheckoutError('SCRIPT_ERROR', 'PayPal SDK failed to load', { cause: error });
        }
    }

    public isSdkLoaded(): Promise<void> {
        if (this.sdkLoadingPromise === undefined) {
            return Promise.reject();
        }

        return this.sdkLoadingPromise;
    }
}

export { PayPalSdkLoader };
