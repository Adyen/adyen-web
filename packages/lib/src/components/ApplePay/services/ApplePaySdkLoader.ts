import Script from '../../../utils/Script';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { AnalyticsModule } from '../../../types/global-types';

export const APPLE_PAY_SDK_URL = 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js';

class ApplePaySdkLoader {
    private sdkLoadingPromise: Promise<void>;
    private readonly analytics: AnalyticsModule;

    constructor({ analytics }: { analytics: AnalyticsModule }) {
        this.analytics = analytics;
    }

    public async load(): Promise<ApplePaySession> {
        try {
            const scriptElement = new Script({
                src: APPLE_PAY_SDK_URL,
                component: 'applepay',
                attributes: { crossOrigin: 'anonymous' },
                analytics: this.analytics
            });

            this.sdkLoadingPromise = scriptElement.load();
            await this.sdkLoadingPromise;

            return window?.ApplePaySession;
        } catch (error) {
            throw new AdyenCheckoutError('SCRIPT_ERROR', 'ApplePaySDK failed to load', { cause: error });
        }
    }

    public isSdkLoaded(): Promise<void> {
        if (this.sdkLoadingPromise === undefined) {
            return Promise.reject();
        }

        return this.sdkLoadingPromise;
    }
}

export default ApplePaySdkLoader;
