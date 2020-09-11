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
    transStatus?: ResultValue;
    threeDSCompInd?: ResultValue;
}

export interface ChallengeObject {
    result: ResultObject;
    type: 'ChallengeShopper' | 'IdentifyShopper' | 'challengeResult' | 'fingerPrintResult';
    errorCode?: string;
}

export interface ChallengeToken {
    acsTransID?: string;
    acsURL?: string;
    messageVersion?: string;
    threeDSNotificationURL?: string;
    threeDSServerTransID?: string;
    threeDSMethodNotificationURL?: string;
    threeDSMethodUrl?: string;
}

export interface FingerPrintData {
    serverTransactionID: string;
    methodURL: string;
    threedsMethodNotificationURL: string;
    postMessageDomain: string;
}
