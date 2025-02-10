import Script from '../../../utils/Script';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';

export const APPLE_PAY_SDK_URL = 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js';

class ApplePaySdkLoader {
    private sdkLoadingPromise: Promise<void>;

    public async load(): Promise<ApplePaySession> {
        try {
            const scriptElement = new Script(APPLE_PAY_SDK_URL, 'body', { crossOrigin: 'anonymous' });
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

export { ApplePaySdkLoader };
