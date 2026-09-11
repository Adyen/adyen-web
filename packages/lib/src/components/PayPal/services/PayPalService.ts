import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import type { PaymentAmount } from '../../../types';
import { PayPalSdkLoader } from './PayPalSdkLoader';
import type { PayPalComponents, PayPalEligiblePaymentMethods, PayPalPageTypes, PayPalPaymentFlow, PayPalSdkInstance } from '../paypal-js-types';
import requestPayPalOauthToken from './request-paypal-oauth-token';
import { PayPalV6SupportedLocale } from '../utils/types';
import { getSupportedLocalePayPalV6 } from '../utils/get-paypal-locale';

interface PayPalServiceConfig {
    sdkLoader: PayPalSdkLoader;
    loadingContext: string;
    clientKey: string;
    merchantId: string;
    countryCode: string;
    amount?: PaymentAmount;
    vault: boolean;
    locale?: string;
    pageType?: PayPalPageTypes;
    environment?: string;
    components: PayPalComponents;
}

class PayPalService {
    private readonly sdkLoader: PayPalSdkLoader;
    private readonly loadingContext: string;
    private readonly clientKey: string;
    private readonly merchantId: string;
    private readonly amount?: PaymentAmount;
    private readonly countryCode: string;
    private readonly vault: boolean;
    private readonly locale?: PayPalV6SupportedLocale;
    private readonly pageType?: PayPalPageTypes;
    private readonly environment?: string;
    private readonly components: PayPalComponents;

    private loadingPromise?: Promise<void>;
    private sdkInstance: PayPalSdkInstance;
    private eligiblePaymentMethods: PayPalEligiblePaymentMethods;

    constructor({
        sdkLoader,
        loadingContext,
        clientKey,
        merchantId,
        amount,
        countryCode,
        vault,
        locale,
        pageType,
        environment,
        components
    }: PayPalServiceConfig) {
        this.sdkLoader = sdkLoader;
        this.loadingContext = loadingContext;
        this.clientKey = clientKey;
        this.merchantId = merchantId;
        this.amount = amount ? { ...amount } : undefined;
        this.countryCode = countryCode;
        this.vault = vault;
        this.locale = getSupportedLocalePayPalV6(locale ?? '') ?? undefined;
        this.pageType = pageType;
        this.environment = environment;
        this.components = components;

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
            throw new AdyenCheckoutError('ERROR', 'PayPal SDK `createInstance` is not available');
        }

        const isLiveEnvironment = this.environment?.toLowerCase() === 'live';
        this.sdkInstance = await createInstance({
            clientToken,
            components: this.components,
            pageType: this.pageType,
            merchantId: this.merchantId,
            locale: this.locale,
            testBuyerCountry: isLiveEnvironment ? undefined : this.countryCode
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

        this.eligiblePaymentMethods = await this.sdkInstance.findEligibleMethods({
            currencyCode: this.amount?.currency,
            // @ts-expect-error: @paypal/paypal-js/sdk-v6 is missing countryCode in the types
            countryCode: this.countryCode,
            paymentFlow
        });
    }

    public getInstance(): PayPalSdkInstance {
        return this.sdkInstance;
    }

    public getEligiblePaymentMethods(): PayPalEligiblePaymentMethods {
        return this.eligiblePaymentMethods;
    }
}

export { PayPalService, type PayPalServiceConfig };
