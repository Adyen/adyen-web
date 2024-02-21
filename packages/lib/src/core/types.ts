import { CustomTranslations, Translation } from '../language/types';
import {
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
import { AnalyticsOptions } from './Analytics/types';
import { RiskModuleOptions } from './RiskModule/RiskModule';
import UIElement from '../components/internal/UIElement/UIElement';
import AdyenCheckoutError from './Errors/AdyenCheckoutError';
import { onBalanceCheckCallbackType, onOrderRequestCallbackType } from '../components/Giftcard/types';
import { SRPanelConfig } from './Errors/types';
import { NewableComponent } from './core.registry';
import Session from './CheckoutSession';
import PaymentMethods from './ProcessResponse/PaymentMethods';

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
        element: UIElement,
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
     * @param element
     */
    onPaymentCompleted?(data: SessionsResponse | { resultCode: ResultCode; donationToken?: string }, element?: UIElement): void;

    /**
     * Called when the payment fails.
     *
     * The first parameter is populated when merchant is using sessions, or when the payment was rejected
     * with an object. (Ex: 'action.reject(obj)' ). Otherwise, it will be empty.
     *
     * @param data - session response or resultCode. It can also be undefined if payment was rejected without argument ('action.reject()')
     * @param element
     */
    onPaymentFailed?(data?: SessionsResponse | { resultCode: ResultCode }, element?: UIElement): void;

    onSubmit?(
        state: any,
        element: UIElement,
        actions: {
            resolve: (response: CheckoutAdvancedFlowResponse) => void;
            reject: () => void;
        }
    ): void;

    /**
     * Callback used in the Advanced flow to perform the /payments/details API call.
     *
     * @param state
     * @param element - Component submitting details. It is undefined when using checkout.submitDetails()
     * @param actions
     */
    onAdditionalDetails?(
        state: AdditionalDetailsStateData,
        element: UIElement,
        actions: {
            resolve: (response: CheckoutAdvancedFlowResponse) => void;
            reject: () => void;
        }
    ): void;

    onActionHandled?(data: ActionHandledReturnObject): void;

    onChange?(state: any, element: UIElement): void;

    onError?(error: AdyenCheckoutError, element?: UIElement): void;

    onBalanceCheck?: onBalanceCheckCallbackType;

    onOrderRequest?: onOrderRequestCallbackType;

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
     * @internal
     */
    loadingContext?: string;
}
