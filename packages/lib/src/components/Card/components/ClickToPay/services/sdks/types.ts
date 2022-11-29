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
    panExpirationMonth: string;
    panExpirationYear: string;
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

export interface SrcInitParams {
    srcInitiatorId: string;
    srciDpaId: string;
}
