import Session from './CheckoutSession';
import PaymentMethods from './ProcessResponse/PaymentMethods';
import AdyenCheckoutError from './Errors/AdyenCheckoutError';

import type { CustomTranslations } from '../language/types';
import type {
    PaymentAmountExtended,
    Order,
    PaymentAction,
    PaymentMethodsResponse,
    ActionHandledReturnObject,
    CheckoutAdvancedFlowResponse,
    PaymentMethodsRequestData,
    SessionsResponse,
    ResultCode,
    AdditionalDetailsStateData
} from '../types/global-types';
import type { AnalyticsOptions } from './Analytics/types';
import type { RiskModuleOptions } from './RiskModule/RiskModule';
import type { onBalanceCheckCallbackType, onOrderRequestCallbackType } from '../components/Giftcard/types';
import type { SRPanelConfig } from './Errors/types';
import type { NewableComponent } from './core.registry';
import type { onOrderCancelType } from '../components/Dropin/types';
import type { IUIElement } from '../components/internal/UIElement/types';

export interface ICore {
    initialize(): Promise<ICore>;
    register(...items: NewableComponent[]): void;
    update(options: CoreConfiguration): Promise<ICore>;
    remove(component): ICore;
    submitDetails(details: any): void;
    getCorePropsForComponent(): any;
    getComponent(txVariant: string): NewableComponent | undefined;
    createFromAction(action: PaymentAction, options: any): any;
    storeElementReference(element: IUIElement): void;
    options: CoreConfiguration;
    paymentMethodsResponse: PaymentMethods;
    session?: Session;
}

export type AdyenEnvironment = 'test' | 'live' | 'live-us' | 'live-au' | 'live-apse' | 'live-in' | string;

export type PaymentCompletedData = SessionsResponse | { resultCode: ResultCode; donationToken?: string };

export type PaymentFailedData = SessionsResponse | { resultCode: ResultCode };

export interface CoreConfiguration {
    /**
     * The payment session object from your call to /sessions. Contains a session.id and session.sessionData
     */
    session?: {
        id: string;
        sessionData: string;
    };
    /**
     * Use test. When you're ready to accept live payments, change the value to one of our {@link https://docs.adyen.com/checkout/drop-in-web#testing-your-integration | live environments}.
     */
    environment?: AdyenEnvironment;

    /**
     * Show or hides a Pay Button for each payment method
     * @default true
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

    analytics?: AnalyticsOptions;

    risk?: RiskModuleOptions;

    order?: Order;

    /**
     * Add @adyen/web metadata to the window object.
     * It helps to identify version number and bundle type in the merchant environment
     *
     * @default true
     */
    exposeLibraryMetadata?: boolean;

    beforeRedirect?(
        resolve: () => void,
        reject: () => void,
        redirectData: {
            url: string;
            method: string;
            data?: any;
        }
    ): void;

    beforeSubmit?(
        state: any,
        component: IUIElement,
        actions: {
            resolve: (data: any) => void;
            reject: () => void;
        }
    ): void;

    /**
     * Called when the payment succeeds.
     *
     * The first parameter is the sessions response (when using sessions flow), or the result code.
     *
     * @param data
     * @param component
     */
    onPaymentCompleted?(data: PaymentCompletedData, component?: IUIElement): void;

    /**
     * Called when the payment fails.
     *
     * The first parameter is populated when merchant is using sessions, or when the payment was rejected
     * with an object. (Ex: 'action.reject(obj)' ). Otherwise, it will be empty.
     *
     * @param data - session response or resultCode. It can also be undefined if payment was rejected without argument ('action.reject()')
     * @param component
     */
    onPaymentFailed?(data?: PaymentFailedData, component?: IUIElement): void;

    onSubmit?(
        state: any,
        component: IUIElement,
        actions: {
            resolve: (response: CheckoutAdvancedFlowResponse) => void;
            reject: (error?: Pick<CheckoutAdvancedFlowResponse, 'error'>) => void;
        }
    ): void;

    /**
     * Callback used in the Advanced flow to perform the /payments/details API call.
     *
     * @param state
     * @param component - Component submitting details. It is undefined when using checkout.submitDetails()
     * @param actions
     */
    onAdditionalDetails?(
        state: AdditionalDetailsStateData,
        component: IUIElement,
        actions: {
            resolve: (response: CheckoutAdvancedFlowResponse) => void;
            reject: () => void;
        }
    ): void;

    onActionHandled?(data: ActionHandledReturnObject): void;

    onChange?(state: any, component: IUIElement): void;

    onError?(error: AdyenCheckoutError, component?: IUIElement): void;

    onBalanceCheck?: onBalanceCheckCallbackType;

    onOrderRequest?: onOrderRequestCallbackType;

    onPaymentMethodsRequest?(
        data: PaymentMethodsRequestData,
        actions: { resolve: (response: PaymentMethodsResponse) => void; reject: () => void }
    ): void;

    onOrderCancel?: onOrderCancelType;

    /**
     * Called when the gift card balance is less than the transaction amount.
     * Returns an Order object that includes the remaining amount to be paid.
     * https://docs.adyen.com/payment-methods/gift-cards/web-component?tab=config-sessions_1
     */
    onOrderUpdated?(data: { order: Order }): void;

    /**
     * @internal
     */
    loadingContext?: string;

    /**
     * Used internally in order to set different URL's instead of using the ones mapped in our codebase.
     *
     * @internal
     */
    _environmentUrls?: {
        api?: string;
        analytics?: string;
        cdn?: {
            images?: string;
            translations?: string;
        };
    };
}
