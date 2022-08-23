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

export interface SrcInitParams {
    srcInitiatorId: string;
    srciDpaId: string;
}
