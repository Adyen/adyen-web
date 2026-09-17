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

/**
 * Configuration accepted by 'PayPalService.refresh'. The SDK loader is excluded since the PayPal SDK script
 * itself is loaded only once, and it is not affected by configuration changes.
 */
type PayPalServiceRefreshConfig = Omit<PayPalServiceConfig, 'sdkLoader'>;

class PayPalService {
    private readonly sdkLoader: PayPalSdkLoader;
    private loadingContext: string;
    private clientKey: string;
    private merchantId: string;
    private amount?: PaymentAmount;
    private countryCode: string;
    private vault: boolean;
    private locale?: PayPalV6SupportedLocale;
    private pageType?: PayPalPageTypes;
    private environment?: string;
    private components: PayPalComponents;

    private loadingPromise?: Promise<void>;
    private sdkInstance: PayPalSdkInstance;
    private eligiblePaymentMethods: PayPalEligiblePaymentMethods;

    constructor({ sdkLoader, ...config }: PayPalServiceConfig) {
        this.sdkLoader = sdkLoader;

        this.createPayPalSdkInstance = this.createPayPalSdkInstance.bind(this);
        this.createEligibleMethods = this.createEligibleMethods.bind(this);
        this.initialize = this.initialize.bind(this);
        this.refresh = this.refresh.bind(this);

        this.applyConfig(config);

        void sdkLoader.load();
    }

    public async initialize(): Promise<void> {
        if (this.loadingPromise !== undefined) {
            return this.loadingPromise;
        }

        return this.load();
    }

    /**
     * Re-creates the PayPal SDK instance and re-evaluates the eligible payment methods using the given
     * configuration. It is used when the merchant updates the configuration of the component, since both the
     * SDK instance and the eligible payment methods are derived from it.
     *
     * @remarks
     * The internal loading promise is replaced synchronously, therefore this method must be called before the
     * element re-mounts. The re-mounted component then awaits the new promise, instead of reading the outdated
     * SDK instance.
     *
     * @param config - Configuration used to create the new SDK instance and eligible payment methods
     */
    public refresh(config: PayPalServiceRefreshConfig): Promise<void> {
        this.applyConfig(config);
        return this.load();
    }

    private applyConfig(config: PayPalServiceRefreshConfig): void {
        this.loadingContext = config.loadingContext;
        this.clientKey = config.clientKey;
        this.merchantId = config.merchantId;
        this.countryCode = config.countryCode;
        this.amount = config.amount ? { ...config.amount } : undefined;
        this.vault = config.vault;
        this.locale = getSupportedLocalePayPalV6(config.locale ?? '') ?? undefined;
        this.pageType = config.pageType;
        this.environment = config.environment;
        this.components = config.components;
    }

    /**
     * Requests a client token and creates both the SDK instance and the eligible payment methods.
     *
     * @remarks
     * Not declared as 'async' on purpose: the loading promise must be assigned synchronously, so that
     * consumers calling 'isSdkLoaded' right after never observe a resolved promise of a previous load.
     */
    private load(): Promise<void> {
        const isSdkLoaderLoadedPromise = this.sdkLoader.isSdkLoaded();
        const tokenDataPromise = requestPayPalOauthToken(this.loadingContext, { clientKey: this.clientKey, merchantId: this.merchantId });

        this.loadingPromise = Promise.all([isSdkLoaderLoadedPromise, tokenDataPromise])
            .then(([_loadedSdk, tokenData]) => {
                return tokenData.clientToken;
            })
            .then(this.createPayPalSdkInstance)
            .then(this.createEligibleMethods)
            .catch(error => {
                this.loadingPromise = undefined;
                throw error;
            });

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

export { PayPalService, type PayPalServiceConfig, type PayPalServiceRefreshConfig };
