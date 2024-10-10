import { ADDRESS_SCHEMA } from '../components/internal/Address/constants';
import actionTypes from '../core/ProcessResponse/PaymentAction/actionTypes';
import { AnalyticsInitialEvent, AnalyticsObject, CreateAnalyticsEventObject, SendAnalyticsObject } from '../core/Analytics/types';
import { EventsQueueModule } from '../core/Analytics/EventsQueue';
import { CbObjOnFocus } from '../components/internal/SecuredFields/lib/types';

export type PaymentActionsType = keyof typeof actionTypes;

/**
 * {@link https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v51/payments__resParam_action API Explorer /payments action}
 */
export interface PaymentAction {
    /**
     * General type of action that needs to be taken by the client
     */
    type: PaymentActionsType;

    /**
     * Refinement of type of action that needs to be taken by the client (currently only applies to the new 'threeDS2' type)
     */
    subtype?: string;

    /**
     * Specifies the payment method.
     */
    paymentMethodType: string;

    /**
     * When non-empty, contains a value that you must submit to the /payments/details endpoint. In some cases, required for polling.
     */
    paymentData?: string; // comes from the /payments endpoint
    authorisationToken?: string; // comes from the /submitThreeDS2Fingerprint endpoint

    // Redirect Actions

    /**
     * Specifies the HTTP method, for example GET or POST.
     */
    method?: string;

    /**
     * Specifies the URL to redirect to.
     */
    url?: string;

    // Vouchers

    alternativeReference?: string;
    downloadUrl?: string;
    entity?: string;
    expiresAt?: string;
    instructionsUrl?: string;
    issuer?: string;
    maskedTelephoneNumber?: string;
    merchantName?: string;
    merchantReference?: string;
    reference?: string;
    shopperEmail?: string;
    shopperName?: string;

    // QR Code

    qrCodeData?: string;

    // 3DS2

    /**
     * A token to pass to the 3DS2 Component to get the fingerprint/challenge.
     */
    token?: string;

    // SDK

    /**
     * An object containing data to be used in external SDKs like PayPal Buttons SDK.
     */
    sdkData?: {
        [key: string]: any;
    };
}

type Issuer = {
    id: string;
    name: string;
    disabled?: boolean;
};

export interface PaymentMethod {
    /**
     * The unique payment method code.
     */
    type: string;

    /**
     * The displayable name of this payment method.
     */
    name: string;

    /**
     * A list of issuers for this payment method.
     */
    issuers?: Issuer[];

    /**
     * Configuration props as set by the merchant in the CA and received in the PM object in the /paymentMethods response
     */
    configuration?: object;

    /**
     * Brand for the selected gift card. For example: plastix, hmclub.
     */
    brand?: string;

    /**
     * List of possible brands. For example: visa, mc.
     */
    brands?: string[];

    /**
     * The funding source of the payment method.
     */
    fundingSource?: 'debit' | 'credit';

    /**
     * The group where this payment method belongs to.
     */
    group?: PaymentMethodGroup;
}

/**
 * List of the available payment methods
 * {@link https://docs.adyen.com/api-explorer/Checkout/70/post/paymentMethods API Explorer /paymentMethods}.
 */
export interface PaymentMethodsResponse {
    /**
     * Detailed list of payment methods required to generate payment forms.
     */
    paymentMethods?: PaymentMethod[];
    /**
     * List of all stored payment methods.
     */
    storedPaymentMethods?: StoredPaymentMethod[];
}

export interface StoredPaymentMethod extends PaymentMethod {
    id: string;
    name: string;
    supportedShopperInteractions: string[];
    expiryMonth?: string;
    expiryYear?: string;
    holderName?: string;
    iban?: string;
    lastFour?: string;
    networkTxReference?: string;
    ownerName?: string;
    shopperEmail?: string;
    /** The shopper’s issuer account label */
    label?: string;
    /**
     * A unique identifier of this stored payment method. Mapped from 'storedPaymentMethod.id'
     * @internal
     */
    storedPaymentMethodId?: string;
    /**
     * Internal flag
     * @internal
     */
    isStoredPaymentMethod?: boolean;
}

/**
 * The group where this payment method belongs to.
 */
export interface PaymentMethodGroup {
    /**
     * The name of the group.
     */
    name: string;

    /**
     * Echo data to be used if the payment method is displayed as part of this group.
     */
    paymentMethodData: string;

    /**
     * The unique code of the group.
     */
    type: string;
}

export interface ProcessedResponse {
    type: string;
    props?: object;
}

/**
 * {@link https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v52/payments__reqParam_amount API Explorer /payments amount}
 */
export interface PaymentAmount {
    value: number;
    currency: string;
}

export interface PaymentAmountExtended extends PaymentAmount {
    /**
     * Adds currencyDisplay prop - as a way for the merchant to influence the final display of the amount on the pay button.
     * Defaults to 'symbol'.
     * see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#currencydisplay
     */
    currencyDisplay?: string;
}

export type AddressField = (typeof ADDRESS_SCHEMA)[number];

export type AddressData = {
    [key in AddressField]?: string;
};

export interface PersonalDetailsSchema {
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    shopperEmail?: string;
    telephoneNumber?: string;
}

export interface Order {
    /**
     * The encrypted order data.
     */
    orderData: string;

    /**
     * The pspReference that belongs to the order.
     */
    pspReference: string;

    /**
     * The remaining amount to complete the order.
     */
    remainingAmount?: PaymentAmount;
}

export interface OrderStatus {
    expiresAt: string;
    paymentMethods: {
        amount?: PaymentAmount;
        lastFour?: string;
        type: string;
        name?: string;
        label?: string;
    }[];
    pspReference: string;
    reference: string;
    remainingAmount: PaymentAmount;
}

/**
 * {@link https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v52/post/payments__reqParam_browserInfo API Explorer /payments browserInfo}
 */
export interface BrowserInfo {
    acceptHeader: string;
    colorDepth: number;
    language: string;
    javaEnabled: boolean;
    screenHeight: number;
    screenWidth: number;
    userAgent: string;
    timeZoneOffset: number;
}

/**
 * Visibility options for a fieldset
 */
export type FieldsetVisibility = 'editable' | 'hidden' | 'readOnly';

export interface PaymentMethodData {
    paymentMethod: {
        [key: string]: any;
        checkoutAttemptId?: string;
    };
    browserInfo?: BrowserInfo;
}

/**
 * Represents the payment data that will be submitted to the /payments endpoint
 */
export interface PaymentData extends PaymentMethodData {
    riskData?: {
        clientData: string;
    };
    order?: {
        orderData: string;
        pspReference: string;
    };
    clientStateDataIndicator: boolean;
    sessionData?: string;
    storePaymentMethod?: boolean;
}

export type ResultCode =
    | 'AuthenticationFinished'
    | 'AuthenticationNotRequired'
    | 'Authorised'
    | 'Cancelled'
    | 'ChallengeShopper'
    | 'Error'
    | 'IdentifyShopper'
    | 'PartiallyAuthorised'
    | 'Pending'
    | 'PresentToShopper'
    | 'Received'
    | 'RedirectShopper'
    | 'Refused';

export type SessionsResponse = {
    sessionData: string;
    sessionResult: string;
    resultCode: ResultCode;
};

export interface PaymentMethodsRequestData {
    order?: Order;
    locale?: string;
    countryCode?: string;
}

export interface CheckoutAdvancedFlowResponse {
    resultCode: ResultCode;
    action?: PaymentAction;
    order?: Order;
    donationToken?: string;
    error?: {
        googlePayError?: google.payments.api.PaymentDataError | string;
        applePayError?: ApplePayJS.ApplePayError[] | ApplePayJS.ApplePayError;
    };
}

export interface PaymentResponseData {
    resultCode: ResultCode;
    type?: string;
    action?: PaymentAction;
    sessionData?: string;
    sessionResult?: string;
    order?: Order;
    donationToken?: string;
}

export type RawPaymentResponse = PaymentResponseData &
    CheckoutAdvancedFlowResponse & {
        [key: string]: any;
    };

/**
 * onActionHandled is called for all actions:
 *  - qrcode
 *  - await
 *  - threeds2
 *  - redirect
 *  - sdk
 *  - voucher
 *  - bankTransfer
 */
export type ActionDescriptionType =
    | 'qr-code-loaded'
    | 'polling-started'
    | '3DS2 fingerprint iframe loaded'
    | '3DS2 challenge iframe loaded'
    | 'performing-redirect'
    | 'voucher-presented'
    | 'sdk-loaded';

export interface ActionHandledReturnObject {
    componentType: string;
    actionDescription: ActionDescriptionType;
    originalAction?: PaymentAction;
}

export interface AnalyticsModule {
    setUp: (a: AnalyticsInitialEvent) => Promise<any>;
    getCheckoutAttemptId: () => string;
    getEventsQueue: () => EventsQueueModule;
    createAnalyticsEvent: (a: CreateAnalyticsEventObject) => AnalyticsObject;
    getEnabled: () => boolean;
    sendAnalytics: (component: string, analyticsObj: SendAnalyticsObject, uiElementProps?: any) => void;
}

export type ComponentFocusObject = {
    fieldType: string;
    event: Event | CbObjOnFocus;
};

export type DecodeObject = {
    success: boolean;
    error?: string;
    data?: string;
};
