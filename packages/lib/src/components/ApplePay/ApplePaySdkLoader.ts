import Script from '../../utils/Script';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

const APPLE_PAY_SDK_URL = 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js';

class ApplePaySdkLoader {
    private sdkLoadingPromise: Promise<void>;

    public async load() {
        try {
            const scriptElement = new Script(APPLE_PAY_SDK_URL, 'body', { crossOrigin: '' });
            this.sdkLoadingPromise = scriptElement.load();
            await this.sdkLoadingPromise;
            return window.ApplePaySession;
        } catch (error) {
            throw new AdyenCheckoutError('SCRIPT_ERROR', 'ApplePaySDK failed to load', { cause: error });
        }
    }

    public isSdkLoaded(): Promise<void> {
        return this.sdkLoadingPromise;
    }
}

export { ApplePaySdkLoader };
