export type ResultValue = 'Y' | 'N' | 'U';

export interface ChallengeData {
    acsURL: string;
    cReqData: {
        acsTransID: string;
        messageVersion: string;
        threeDSServerTransID: string;
        messageType: string;
        challengeWindowSize: string;
    };
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
