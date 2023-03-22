/**
 * Type that represent the object which contains the customizable properties of the SDK initialization
 */
export type CustomSdkConfiguration = {
    dpaLocale: string;
    dpaPresentationName: string;
};

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
    checkoutResponse: string;
    checkoutResponseSignature: string;
    idToken: string;
    unbindAppInstance: boolean;
};

export type SrciIdentityLookupResponse = {
    consumerPresent: boolean;
};

export type SrcProfile = {
    profiles: Array<{ maskedCards: SrcCard[] }>;
    srcCorrelationId: string;
};

export type DigitalCardStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';

export type SrcCard = {
    srcDigitalCardId: string;
    panLastFour: string;
    dateOfCardLastUsed: string;
    paymentCardDescriptor: string;
    panExpirationMonth: string;
    panExpirationYear: string;
    digitalCardData: {
        descriptorName: string;
        artUri: string;
        status?: DigitalCardStatus;
    };
    tokenId?: string;
};

export type SrcCheckoutParams = {
    srcCorrelationId: string;
    srcDigitalCardId: string;
    windowRef?: Window;
};

export interface SrcInitParams {
    srcInitiatorId: string;
    srciDpaId: string;
}

export interface SrcIdentityLookupParams {
    identityValue: string;
    type: 'email' | 'telephoneNumber';
}
