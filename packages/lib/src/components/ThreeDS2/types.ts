import { AnalyticsObject } from '../../core/Analytics/types';

/**
 * See
 * https://docs.adyen.com/checkout/3d-secure/api-reference#threeds2result
 * Indicates whether a transaction was authenticated, or whether additional verification is required.
 */
export type ResultValue = 'Y' | 'N' | 'U' | 'A' | 'C' | 'R';

export interface CReqData {
    acsTransID: string;
    messageVersion: string;
    threeDSServerTransID: string;
    messageType: string;
    challengeWindowSize: string;
}

export interface ChallengeData {
    acsURL: string;
    cReqData: CReqData;
    iframeSizeArr: string[];
    postMessageDomain: string;
}

export interface ResultObject {
    threeDSCompInd?: ResultValue; // Fingerprint
    // Challenge
    transStatus?: ResultValue;
    errorCode?: string;
    errorDescription?: string;
}

export interface ThreeDS2FlowObject {
    result: ResultObject;
    type: 'ChallengeShopper' | 'IdentifyShopper' | 'challengeResult' | 'fingerPrintResult';
    errorCode?: string;
    threeDSServerTransID?: string;
}

export interface PostMsgParseErrorObject {
    type?: string;
    comment?: string;
    extraInfo?: string;
    eventDataRaw?: string;
}

// One token fits all - Fingerprint & Challenge
export interface ThreeDS2Token {
    acsTransID?: string;
    acsURL?: string;
    messageVersion?: string;
    threeDSNotificationURL?: string;
    threeDSServerTransID?: string;
    threeDSMethodNotificationURL?: string;
    threeDSMethodUrl?: string;
}

export interface FingerPrintData {
    threeDSServerTransID: string;
    threeDSMethodURL: string;
    threeDSMethodNotificationURL: string;
    postMessageDomain: string;
}

export type ThreeDS2FingerprintResponse = {
    type: 'action' | 'completed';
    action?: CheckoutRedirectAction | CheckoutThreeDS2Action;
    details?: Record<string, string>;
};

type CheckoutRedirectAction = {
    type: 'redirect';
    data: Record<string, string>;
    method: string;
    paymentData: string;
};

type CheckoutThreeDS2Action = {
    type: 'threeDS2';
    token: string;
    subtype: string;
    authorisationToken: string;
};

export type DecodeObject = {
    success: boolean;
    error?: string;
    data?: string;
};

// export type ThreeDS2AnalyticsObject = {
//     class: string;
//     code?: string;
//     errorType?: string;
//     message?: string;
//     type?: string;
//     // action?: string;
//     // target?: string;
// };
export type ThreeDS2AnalyticsObject = Pick<AnalyticsObject, 'code' | 'errorType' | 'message' | 'type'> & {
    class: string;
    metaData?: string; // May be added to /checkoutanalytics
};
