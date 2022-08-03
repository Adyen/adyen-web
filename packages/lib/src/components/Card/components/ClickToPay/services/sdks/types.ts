/**
 * Types used to define the interface with the SRCi SDK
 */
export type SrciInitiateIdentityValidationResponse = {
    maskedValidationChannel: string;
};

export type SrciCompleteIdentityValidationResponse = {
    idToken: string;
};

export type SrciIsRecognizedResponse = {
    recognized: boolean;
    idTokens?: string[];
};

export type SrciCheckoutResponse = {
    dcfActionCode: string;
    encryptedPayload?: string;
    idToken?: string;
};

export type SrciIdentityLookupResponse = {
    consumerPresent: boolean;
};

export type SrcProfile = {
    profiles: Array<{ maskedCards: SrcCard[] }>;
    srcCorrelationId: string;
};

export type SrcCard = {
    srcDigitalCardId: string;
    panLastFour: string;
    dateOfCardLastUsed: string;
    paymentCardDescriptor: string;
    digitalCardData: {
        descriptorName: string;
        artUri: string;
    };
    tokenId?: string;
};

export type SrcCheckoutParams = {
    srcCorrelationId: string;
    srcDigitalCardId: string;
};

/**
 * Initialization parameters (TBD)
 * TODO: clean this up and use only necessary props
 */

export interface SrcInitParams {
    srcInitiatorId: string;
    srciDpaId: string;
}

// interface DpaTransactionOptions {
//     dpaAcceptedBillingCountries?: string[];
//     dpaAcceptedShippingCountries?: string[];
//     dpaBillingPreference?: string;
//     dpaShippingPreference?: string;
//     dpaLocale?: string;
//     consumerNameRequested?: boolean;
//     consumerEmailAddressRequested?: boolean;
//     consumerPhoneNumberRequested?: boolean;
//     checkoutDescription: string;
//     paymentOptions?: PaymentOptions;
//     reviewAction: string; // visa
//     transactionType?: string; // Not supported by MC
//     transactionAmount: TransactionAmount;
//     orderType?: string; // visa
//     isGuestCheckout?: boolean;
//     payloadTypeIndicator: string; // visa
//     payloadTypeIndicatorCheckout?: string; // Not supported by MC
//     payloadTypeIndicatorPayload?: string; // Not supported by MC
//     merchantOrderId: string; //visa
//     merchantCategoryCode: string;
//     merchantCountryCode: string;
//     threeDSInputData?: ThreeDSInputData;
// }

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
