import { PaymentAmount } from '../../types';
import requestFastlaneToken from '../PayPalFastlane/services/request-fastlane-token';
import { PayPalSdkLoader } from './PayPalSdkLoader';

interface PayPalServiceConfig {
    loadingContext: string;
    clientKey: string;
    sdkLoader: PayPalSdkLoader;
    countryCode: string;
    amount: PaymentAmount;
}

class PayPalService {
    private static readonly instances: Map<string, PayPalService> = new Map();

    private static createKey(config: PayPalServiceConfig): string {
        const { loadingContext, clientKey, countryCode, amount } = config;
        return [loadingContext, clientKey, countryCode, amount.currency, amount.value].join(':');
    }

    public static getInstance(config: PayPalServiceConfig): PayPalService {
        const key = PayPalService.createKey(config);

        if (!PayPalService.instances.has(key)) {
            PayPalService.instances.set(key, new PayPalService(config));
        }
        return PayPalService.instances.get(key);
    }

    private readonly sdkLoader: PayPalSdkLoader;
    private readonly loadingContext: string;
    private readonly clientKey: string;
    private readonly amount: PaymentAmount;
    private readonly countryCode: string;

    private loadingPromise: Promise<void> = undefined;
    public sdkInstance: any;
    public paymentMethods: any;

    private constructor({ loadingContext, clientKey, sdkLoader, amount, countryCode }: PayPalServiceConfig) {
        this.sdkLoader = sdkLoader;
        this.loadingContext = loadingContext;
        this.clientKey = clientKey;
        this.amount = { ...amount };
        this.countryCode = countryCode;

        this.createPayPalSdkInstance = this.createPayPalSdkInstance.bind(this);
        this.createPayPalPaymentMethods = this.createPayPalPaymentMethods.bind(this);
        this.initialize = this.initialize.bind(this);

        void sdkLoader.load();
    }

    public async initialize(): Promise<void> {
        if (this.loadingPromise !== undefined) {
            return this.loadingPromise;
        }

        const isSdkLoaderLoadedPromise = this.sdkLoader.isSdkLoaded();
        const tokenDataPromise = requestFastlaneToken(this.loadingContext, this.clientKey);

        this.loadingPromise = Promise.all([isSdkLoaderLoadedPromise, tokenDataPromise])
            .then(([_loadedSdk, tokenData]) => {
                console.log('PayPal SDK loaded and token data received');
                return tokenData.value;
            })
            .then(this.createPayPalSdkInstance)
            .then(this.createPayPalPaymentMethods);

        return this.loadingPromise;
    }

    public async isPayPalSdkReady(): Promise<void> {
        if (!this.loadingPromise) {
            return Promise.reject();
        }

        return this.loadingPromise;
    }

    private async createPayPalSdkInstance(clientToken: string): Promise<any> {
        console.log('createPayPalSdkInstance(): executed');

        // @ts-ignore: paypal instance
        this.sdkInstance = await window.paypal.createInstance({
            clientToken,
            components: ['paypal-payments', 'venmo-payments'],
            pageType: 'checkout'
        });

        console.log('createPayPalSdkInstance(): PayPalSDK instance', this.sdkInstance);

        return this.sdkInstance;
    }

    private async createPayPalPaymentMethods(): Promise<void> {
        console.log('createPayPalPaymentMethods(): executed');

        this.paymentMethods = await this.sdkInstance.findEligibleMethods({
            currencyCode: this.amount.currency,
            countryCode: this.countryCode,
            paymentFlow: this.amount.value === 0 ? 'VAULT_WITHOUT_PAYMENT' : undefined
        });

        console.log('createPayPalPaymentMethods(): PayPalSDK payment methods', this.paymentMethods);

        return Promise.resolve();
    }
}

export { PayPalService, type PayPalServiceConfig };
