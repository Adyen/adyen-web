import Script from '../../../utils/Script';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import type { IAnalytics } from '../../../core/Analytics/Analytics';

export const PAYPAY_SDK_URL = 'https://static.paypay.ne.jp/libs/smart-payment-js-sdk/2.61.0/smart-payment-js-sdk.js';

class PayPaySdkLoader {
    private sdkLoadingPromise: Promise<void>;
    private readonly analytics: IAnalytics;

    constructor({ analytics }: { analytics: IAnalytics }) {
        this.analytics = analytics;
    }

    public async load(): Promise<void> {
        try {
            const scriptElement = new Script({
                src: PAYPAY_SDK_URL,
                component: 'paypay',
                attributes: { crossOrigin: 'anonymous' },
                analytics: this.analytics
            });

            this.sdkLoadingPromise = scriptElement.load();
            await this.sdkLoadingPromise;
        } catch (error) {
            throw new AdyenCheckoutError('SCRIPT_ERROR', 'PayPay SDK failed to load', { cause: error });
        }
    }

    public isSdkLoaded(): Promise<void> {
        if (this.sdkLoadingPromise === undefined) {
            return Promise.reject();
        }

        return this.sdkLoadingPromise;
    }
}

export default PayPaySdkLoader;
