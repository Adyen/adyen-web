import { CustomTranslations, Translation } from '../language/types';
import {
    PaymentAmountExtended,
    Order,
    PaymentAction,
    PaymentMethodsResponse,
    ActionHandledReturnObject,
    OnPaymentCompletedData,
    PaymentData,
    PaymentResponseAdvancedFlow,
    OnPaymentFailedData,
    PaymentMethodsRequestData
} from '../types/global-types';
import { AnalyticsOptions } from './Analytics/types';
import { RiskModuleOptions } from './RiskModule/RiskModule';
import UIElement from '../components/internal/UIElement/UIElement';
import AdyenCheckoutError from './Errors/AdyenCheckoutError';
import { GiftCardElementData } from '../components/Giftcard/types';
import { SRPanelConfig } from './Errors/types';
import { NewableComponent } from './core.registry';
import Session from './CheckoutSession';
import PaymentMethods from './ProcessResponse/PaymentMethods';

type PromiseResolve = typeof Promise.resolve;

type PromiseReject = typeof Promise.reject;

export interface ICore {
    initialize(): Promise<ICore>;

    register(...items: NewableComponent[]): void;

    update(options: CoreConfiguration): Promise<ICore>;

    remove(component): ICore;

    submitDetails(details: any): void;

    getCorePropsForComponent(): any;

    getComponent(txVariant: string): NewableComponent | undefined;

    createFromAction(action: PaymentAction, options: any): any;

    storeElementReference(element: UIElement): void;

    options: CoreConfiguration;
    paymentMethodsResponse: PaymentMethods;
    session?: Session;
}

export type AdyenEnvironment = 'test' | 'live' | 'live-us' | 'live-au' | 'live-apse' | 'live-in' | string;

export type onSubmitReject = {
    error?: {
        googlePayError?: Partial<google.payments.api.PaymentDataError>;
        applePayError?: ApplePayJS.ApplePayError[] | ApplePayJS.ApplePayError;
    };
};

export interface CoreConfiguration {
    session?: any;
    /**
     * Use test. When you're ready to accept live payments, change the value to one of our {@link https://docs.adyen.com/checkout/drop-in-web#testing-your-integration | live environments}.
     */
    environment?: AdyenEnvironment;

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
     * For adding a custom locale, see {@link https://docs.adyen.com/checkout/components-web/localization-components#create-localization | Create localization}.*
     */
    locale?: string;

    /**
     * Translation file which contains the translations to a certain locale.
     * @default en_US
     */
    translationFile?: Translation;

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
    srConfig?: SRPanelConfig;

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

    /**
     * Called when the payment succeeds.
     *
     * The first parameter is the sessions response (when using sessions flow), or the result code.
     *
     * @param data
     * @param element
     */
    onPaymentCompleted?(data: OnPaymentCompletedData, element?: UIElement): void;

    /**
     * Called when the payment fails.
     *
     * The first parameter is poppulated when merchant is using sessions, or when the payment was rejected
     * with an object. (Ex: 'action.reject(obj)' ). Otherwise, it will be empty.
     *
     * @param data
     * @param element
     */
    onPaymentFailed?(data?: OnPaymentFailedData, element?: UIElement): void;

    onSubmit?(
        state: any,
        element: UIElement,
        actions: {
            resolve: (response: PaymentResponseAdvancedFlow) => void;
            reject: (error?: onSubmitReject) => void;
        }
    ): void;

    onAdditionalDetails?(state: any, element?: UIElement): void;

    onActionHandled?(data: ActionHandledReturnObject): void;

    onChange?(state: any, element: UIElement): void;

    onError?(error: AdyenCheckoutError, element?: UIElement): void;

    onBalanceCheck?(resolve: PromiseResolve, reject: PromiseReject, data: GiftCardElementData): Promise<void>;

    onOrderRequest?(resolve: PromiseResolve, reject: PromiseReject, data: PaymentData): Promise<void>;

    onPaymentMethodsRequest?(
        data: PaymentMethodsRequestData,
        actions: { resolve: (response: PaymentMethodsResponse) => void; reject: () => void }
    ): void;

    onOrderCancel?(order: Order): void;

    /**
     * Called when the gift card balance is less than the transaction amount.
     * Returns an Order object that includes the remaining amount to be paid.
     * https://docs.adyen.com/payment-methods/gift-cards/web-component?tab=config-sessions_1
     */
    onOrderUpdated?(data: { order: Order }): void;

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
