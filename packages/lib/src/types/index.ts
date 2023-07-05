import { ADDRESS_SCHEMA } from '../components/internal/Address/constants';
import actionTypes from '../core/ProcessResponse/PaymentAction/actionTypes';
import { InstallmentOptions } from '../components/Card/components/CardInput/components/types';
import { ResultCode } from '../components/types';

export type PaymentActionsType = keyof typeof actionTypes;

/**
 * {@link https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v51/payments__resParam_action API Explorer /payments action}
 */
export interface PaymentAction {
    /**
     * General type of action that needs to be taken by the client
     */
    type: PaymentActionsType | string;

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
     * All input details to be provided to complete the payment with this payment method.
     */
    details?: object;

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
    fundingSource?: string;

    /**
     * The group where this payment method belongs to.
     */
    group?: PaymentMethodGroup;
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

export interface StoredPaymentMethod extends PaymentMethod {
    /**
     * The supported shopper interactions for this stored payment method.
     */
    supportedShopperInteractions: string[];

    /**
     * A unique identifier of this stored payment method.
     * Mapped from 'storedPaymentMethod.id'
     */
    storedPaymentMethodId?: string;
}

/**
 * List of the available payment methods
 * {@link https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v51/paymentMethods API Explorer /paymentMethods}.
 */
export interface PaymentMethodsResponseInterface {
    /**
     * Detailed list of payment methods required to generate payment forms.
     */
    paymentMethods: PaymentMethod[];

    /**
     * List of all stored payment methods.
     */
    storedPaymentMethods: StoredPaymentMethod[];
}

export interface PaymentResponse {
    type: string;
    resultCode: string;
    url?: string;
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

export type ShopperDetails = {
    shopperName?: {
        firstName?: string;
        lastName?: string;
    };
    shopperEmail?: string;
    countryCode?: string;
    telephoneNumber?: string;
    dateOfBirth?: string;
    billingAddress?: Partial<AddressData>;
    shippingAddress?: Partial<AddressData>;
};

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
        lastFour: string;
        type: string;
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

// /**
//  * Available components
//  */
// export type PaymentMethods = typeof paymentMethods;
//
// /**
//  * Options for a component
//  */
// // @ts-ignore fix later
// export type PaymentMethodOptions<P extends keyof PaymentMethods> = InstanceType<PaymentMethods[P]>['props'];

/**
 * Visibility options for a fieldset
 */
export type FieldsetVisibility = 'editable' | 'hidden' | 'readOnly';

export type CheckoutSession = {
    id: string;
    sessionData: string;
};

export type SessionConfiguration = {
    installmentOptions?: InstallmentOptions;
    enableStoreDetails?: boolean;
};

export type CheckoutSessionSetupResponse = {
    id: string;
    sessionData: string;

    amount: PaymentAmount;
    expiresAt: string;
    paymentMethods: any;
    returnUrl: string;
    configuration: SessionConfiguration;
    /**
     * 'shopperLocale' set during session creation.
     * @defaultValue en-US
     */
    shopperLocale: string;
};

export type CheckoutSessionPaymentResponse = {
    sessionData: string;
    status?: string;
    resultCode: string;
    action?: PaymentAction;
};

export type CheckoutSessionDetailsResponse = {
    sessionData: string;
    sessionResult: string;
    resultCode: ResultCode;
    status?: string;
    action?: PaymentAction;
};

export type CheckoutSessionBalanceResponse = {
    sessionData: string;
    balance?: PaymentAmount;
    transactionLimit?: PaymentAmount;
};

export type CheckoutSessionOrdersResponse = {
    sessionData: string;
    orderData: string;
    pspReference: string;
};
