import { ChallengeData, ChallengeObject } from '../../types';

export interface Do3DS2ChallengeProps {
    acsURL: string;
    cReqData: {
        challengeWindowSize: string;
        [key: string]: any;
    };
    iframeSizeArr: string[];
    onCompleteChallenge: (resolveObject: ChallengeObject) => void;
    onErrorChallenge: (rejectObject: ChallengeObject) => void;
    postMessageDomain: string;
}

export interface Do3DS2ChallengeState {
    base64URLencodedData?: string;
    status?: string;
}

export interface ThreeDS2ChallengeProps {
    challengeToken?: string;
    dataKey?: string;
    notificationURL?: string;
    onComplete?: (data: object) => void;
    onError?: (error: object | string) => void;
    paymentData?: string;
    size?: string;
    type?: string;
}

export interface ThreeDS2ChallengeState {
    challengeData?: ChallengeData;
    status?: string;
}
