import { AdyenCheckoutError, type PaymentAmount } from '../../../types';
import { PayPalSdkLoader } from './PayPalSdkLoader';
import type { PayPalComponents, PayPalEligiblePaymentMethods, PayPalPaymentFlow, PayPalSdkInstance } from '../paypal-js-types';
import requestPayPalOauthToken from './request-paypal-oauth-token';

interface PayPalServiceConfig {
    loadingContext: string;
    clientKey: string;
    merchantId: string;
    sdkLoader: PayPalSdkLoader;
    countryCode: string;
    amount?: PaymentAmount;
    vault: boolean;
}

class PayPalService {
    private readonly sdkLoader: PayPalSdkLoader;
    private readonly loadingContext: string;
    private readonly clientKey: string;
    private readonly merchantId: string;
    private readonly amount?: PaymentAmount;
    private readonly countryCode: string;
    private readonly vault: boolean;

    private loadingPromise?: Promise<void>;
    private sdkInstance: PayPalSdkInstance;
    private eligibleMethods: PayPalEligiblePaymentMethods;

    constructor({ loadingContext, clientKey, merchantId, sdkLoader, amount, countryCode, vault }: PayPalServiceConfig) {
        this.sdkLoader = sdkLoader;
        this.loadingContext = loadingContext;
        this.clientKey = clientKey;
        this.merchantId = merchantId;
        this.amount = amount ? { ...amount } : undefined;
        this.countryCode = countryCode;
        this.vault = vault;

        this.createPayPalSdkInstance = this.createPayPalSdkInstance.bind(this);
        this.createEligibleMethods = this.createEligibleMethods.bind(this);
        this.initialize = this.initialize.bind(this);

        void sdkLoader.load();
    }

    public async initialize(): Promise<void> {
        if (this.loadingPromise !== undefined) {
            return this.loadingPromise;
        }

        const isSdkLoaderLoadedPromise = this.sdkLoader.isSdkLoaded();
        const tokenDataPromise = requestPayPalOauthToken(this.loadingContext, { clientKey: this.clientKey, merchantId: this.merchantId });

        this.loadingPromise = Promise.all([isSdkLoaderLoadedPromise, tokenDataPromise])
            .then(([_loadedSdk, tokenData]) => {
                return tokenData.clientToken;
            })
            .then(this.createPayPalSdkInstance)
            .then(this.createEligibleMethods);

        return this.loadingPromise;
    }

    public async isSdkLoaded(): Promise<void> {
        if (this.loadingPromise === undefined) {
            return Promise.reject(new Error('PayPal SDK not loaded'));
        }

        return this.loadingPromise;
    }

    private async createPayPalSdkInstance(clientToken: string): Promise<PayPalSdkInstance> {
        const paypal = window.paypal;
        const createInstance = paypal?.v6?.createInstance || paypal?.createInstance;

        if (!createInstance) {
            return Promise.reject(new AdyenCheckoutError('ERROR', 'PayPal SDK `createInstance` is not available'));
        }

        this.sdkInstance = await createInstance({
            clientToken,
            components: ['paypal-payments', 'venmo-payments'] satisfies PayPalComponents,
            pageType: 'checkout'
        });

        return this.sdkInstance;
    }

    private async createEligibleMethods(): Promise<void> {
        const isZeroAuth = this.amount?.value === 0;

        let paymentFlow: PayPalPaymentFlow | undefined;
        if (isZeroAuth) {
            paymentFlow = 'VAULT_WITHOUT_PAYMENT';
        } else if (this.vault) {
            paymentFlow = 'VAULT_WITH_PAYMENT';
        }

        this.eligibleMethods = await this.sdkInstance.findEligibleMethods({
            currencyCode: this.amount?.currency,
            // @ts-expect-error: @paypal/paypal-js is missing countryCode in the types
            countryCode: this.countryCode,
            paymentFlow
        });
    }

    public getInstance(): PayPalSdkInstance {
        return this.sdkInstance;
    }

    public getEligibleMethods(): PayPalEligiblePaymentMethods {
        return this.eligibleMethods;
    }
}

export { PayPalService, type PayPalServiceConfig };
