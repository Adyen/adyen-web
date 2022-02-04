export interface InitParams {
    srcInitiatorId: string;
    srciTransactionId: string;
    srciDpaId: string;
    dpaTransactionOptions: DpaTransactionOptions;
    dpaData?: DpaData;
}

export type CheckoutParams = {
    srcCorrelationId: string;
    srcDigitalCardId: string;
    idToken: string;
};

export interface IdentityLookupParams {
    value: string;
    type: string;
}

interface DpaTransactionOptions {
    dpaAcceptedBillingCountries?: string[];
    dpaAcceptedShippingCountries?: string[];
    dpaBillingPreference?: string;
    dpaShippingPreference?: string;
    dpaLocale?: string;
    consumerNameRequested?: boolean;
    consumerEmailAddressRequested?: boolean;
    consumerPhoneNumberRequested?: boolean;
    checkoutDescription: string;
    paymentOptions?: PaymentOptions;
    reviewAction: string; // visa
    transactionType?: string; // Not supported by MC
    transactionAmount: TransactionAmount;
    orderType?: string; // visa
    isGuestCheckout?: boolean;
    payloadTypeIndicator: string; // visa
    payloadTypeIndicatorCheckout?: string; // Not supported by MC
    payloadTypeIndicatorPayload?: string; // Not supported by MC
    merchantOrderId: string; //visa
    merchantCategoryCode: string;
    merchantCountryCode: string;
    threeDSInputData?: ThreeDSInputData;
}

interface ThreeDSInputData {
    requestorId: string;
    acquirerId: string;
    acquirerMid: string;
}

interface TransactionAmount {
    transactionAmount: number;
    transactionCurrencyCode: string;
}

interface PaymentOptions {
    // Visa
    dpaPanRequested?: string;
    // Mastercard docs
    dpaDynamicDataTTLMinutes?: string; // Not supported by MC
    dynamicDataType?: string;
}

interface DpaData {
    srcdpaId: string; // might not be needed
    dpaPresentationName?: string;
    dpaUri: string;
    dpaThreeDsPreference: 'ONBEHALF' | 'SELF' | 'NONE' | 'UNKNOWN';
}

export type IdentityLookupResponse = {
    consumerPresent: boolean;
};

export type InitiateIdentityValidationResponse = {
    maskedValidationChannel: string;
};

export type CompleteIdentityValidationResponse = {
    idToken: string;
};

export type IsRecognizedResponse = {
    recognized: boolean;
    idTokens?: string[];
};

export type CheckoutResponse = {
    checkoutResponse: string;
    dcfActionCode: string;
    idToken: string;
    unbindAppInstance: boolean;
};
