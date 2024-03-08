import { CustomTranslations, Locales } from '../language/types';
import { PaymentMethods, PaymentMethodOptions, PaymentActionsType, PaymentAmountExtended, Order } from '../types';
import { AnalyticsOptions } from './Analytics/types';
import { PaymentMethodsResponse } from './ProcessResponse/PaymentMethodsResponse/types';
import { RiskModuleOptions } from './RiskModule/RiskModule';
import { ActionHandledReturnObject, OnPaymentCompletedData, PaymentData, UIElementProps } from '../components/types';
import UIElement from '../components/UIElement';
import AdyenCheckoutError from './Errors/AdyenCheckoutError';
import { GiftCardElementData } from '../components/Giftcard/types';
import { SRPanelProps } from './Errors/types';

type PromiseResolve = typeof Promise.resolve;

type PromiseReject = typeof Promise.reject;

export interface CoreOptions {
    session?: any;
    /**
     * Use test. When you're ready to accept live payments, change the value to one of our {@link https://docs.adyen.com/checkout/drop-in-web#testing-your-integration | live environments}.
     */
    environment?: 'test' | 'live' | 'live-us' | 'live-au' | 'live-apse' | 'live-in' | string;

    /**
     * Used internally by Pay By Link in order to set its own URL's instead of using the ones mapped in our codebase.
     *
     * @internal
     */
    environmentUrls?: {
        api?: string;
        analytics?: string;
    };

    /**
     * Show or hides a Pay Button for each payment method
     */
    showPayButton?: boolean;

    /**
     * A public key linked to your web service user, used for {@link https://docs.adyen.com/user-management/client-side-authentication | client-side authentication}.
     */
    clientKey?: string;

    /**
     * The shopper's locale. This is used to set the language rendered in the UI.
     * For a list of supported locales, see {@link https://docs.adyen.com/checkout/components-web/localization-components | Localization}.
     * For adding a custom locale, see {@link https://docs.adyen.com/checkout/components-web/localization-components#create-localization | Create localization}.
     * @defaultValue 'en-US'
     */
    locale?: Locales | string;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components | Localizing Components}
     */
    translations?: CustomTranslations;

    /**
     * The full `/paymentMethods` response
     */
    paymentMethodsResponse?: PaymentMethodsResponse;

    /**
     * Amount of the payment
     */
    amount?: PaymentAmountExtended;

    /**
     * Secondary amount of the payment - alternative currency & value converted according to rate
     */
    secondaryAmount?: PaymentAmountExtended;

    /**
     * The shopper's country code. A valid value is an ISO two-character country code (e.g. 'NL').
     */
    countryCode?: string;

    /**
     * Optional per payment method configuration
     */
    paymentMethodsConfiguration?: PaymentMethodsConfiguration;

    /**
     * Display only these payment methods
     */
    allowPaymentMethods?: string[];

    /**
     * Never display these payment methods
     */
    removePaymentMethods?: string[];

    /**
     * Screen Reader configuration
     */
    srConfig?: SRPanelProps;

    /**
     * @internal
     */
    //TODO: maybe type this?
    cdnContext?: string;

    resourceEnvironment?: string;

    analytics?: AnalyticsOptions;

    risk?: RiskModuleOptions;

    order?: Order;

    setStatusAutomatically?: boolean;

    beforeRedirect?(
        resolve: PromiseResolve,
        reject: PromiseReject,
        redirectData: {
            url: string;
            method: string;
            data?: any;
        }
    ): Promise<void>;

    beforeSubmit?(
        state: any,
        element: UIElement,
        actions: {
            resolve: PromiseResolve;
            reject: PromiseReject;
        }
    ): Promise<void>;

    onPaymentCompleted?(data: OnPaymentCompletedData, element?: UIElement): void;

    onSubmit?(state: any, element: UIElement): void;

    onAdditionalDetails?(state: any, element?: UIElement): void;

    onActionHandled?(data: ActionHandledReturnObject): void;

    onChange?(state: any, element: UIElement): void;

    onError?(error: AdyenCheckoutError, element?: UIElement): void;

    onBalanceCheck?(resolve: PromiseResolve, reject: PromiseReject, data: GiftCardElementData): Promise<void>;

    onOrderRequest?(resolve: PromiseResolve, reject: PromiseReject, data: PaymentData): Promise<void>;

    onOrderCancel?(order: Order): void;

    /**
     * Only used in Components combined with Sessions flow
     * Callback used to inform when the order is created.
     * https://docs.adyen.com/payment-methods/gift-cards/web-component?tab=config-sessions_1
     */
    onOrderCreated?(data: { order: Order }): void;

    /**
     * Used only in the Donation Component when shopper declines to donate
     * https://docs.adyen.com/online-payments/donations/web-component
     */
    onCancel?(): void;

    /**
     * @internal
     */
    loadingContext?: string;
}

type PaymentMethodsConfigurationMap = {
    [key in keyof PaymentMethods]?: Partial<PaymentMethodOptions<key>>;
};

type PaymentActionTypesMap = {
    [key in PaymentActionsType]?: Partial<UIElementProps> & { challengeWindowSize?: string };
};

/**
 * Type must be loose, otherwise it will take priority over the rest
 */
type NonMappedPaymentMethodsMap = {
    [key: string]: any;
};

export type PaymentMethodsConfiguration = PaymentMethodsConfigurationMap & PaymentActionTypesMap & NonMappedPaymentMethodsMap;
