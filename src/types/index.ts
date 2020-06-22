/**
 * {@link https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v51/payments__resParam_action API Explorer /payments action}
 */
export interface PaymentAction {
    /**
     * Typpe of action that needs to be taken by the client
     */
    type: string;

    /**
     * Specifies the payment method.
     */
    paymentMethodType: string;

    /**
     * When non-empty, contains a value that you must submit to the /payments/details endpoint. In some cases, required for polling.
     */
    paymentData?: string;

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

    // 3DS2

    /**
     * A token to pass to the 3DS2 Component to get the fingerprint/challenge.
     */
    token?: string;

    // SDK

    /**
     * An object containing data to be used in external SDKs like PayPal Buttons SDK.
     */
    sdkData?: any;
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
}

export interface StoredPaymentMethod extends PaymentMethod {
    /**
     * The supported shopper interactions for this stored payment method.
     */
    supportedShopperInteractions: string[];

    /**
     * A unique identifier of this stored payment method.
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
 * {@link https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v51/payments__reqParam_splits-amount API Explorer /payments action}
 */
export interface PaymentAmount {
    value: number;
    currency: string;
}

export interface Address {
    street?: string;
    houseNumberOrName?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    stateOrProvince?: string;
}
