import requestFastlaneToken from '../PayPalFastlane/services/request-fastlane-token';
import { PayPalSdkLoader } from './PayPalSdkLoader';

class PayPalService {
    private readonly sdkLoader: PayPalSdkLoader;
    private readonly loadingContext: string;
    private readonly clientKey: string;

    private loadingPromise: Promise<void>;
    public sdkInstance: any;

    constructor({ loadingContext, clientKey, sdkLoader }: { loadingContext: string; clientKey: string; sdkLoader: PayPalSdkLoader }) {
        this.sdkLoader = sdkLoader;
        this.loadingContext = loadingContext;
        this.clientKey = clientKey;

        this.createPayPalSdkInstance = this.createPayPalSdkInstance.bind(this);
        this.initialize = this.initialize.bind(this);

        void sdkLoader.load();
    }

    public async initialize(): Promise<void> {
        const isSdkLoaderLoadedPromise = this.sdkLoader.isSdkLoaded();
        const tokenDataPromise = requestFastlaneToken(this.loadingContext, this.clientKey);

        this.loadingPromise = Promise.all([isSdkLoaderLoadedPromise, tokenDataPromise])
            .then(([_loadedSdk, tokenData]) => {
                console.log('PayPal SDK loaded and token data received');
                return tokenData.value;
            })
            .then(this.createPayPalSdkInstance);

        return this.loadingPromise;
    }

    public async isPayPalSdkReady(): Promise<void> {
        if (!this.loadingPromise) {
            return Promise.reject();
        }

        return this.loadingPromise;
    }

    private async createPayPalSdkInstance(clientToken: string): Promise<void> {
        console.log('createPayPalSdkInstance(): executed');

        // @ts-ignore
        this.sdkInstance = await window.paypal.createInstance({
            clientToken,
            components: ['paypal-payments', 'venmo-payments'],
            pageType: 'checkout'
        });

        console.log('createPayPalSdkInstance(): PayPalSDK instance', this.sdkInstance);
    }
}

export { PayPalService };
