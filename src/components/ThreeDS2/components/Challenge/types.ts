import { ChallengeData, ChallengeObject, CReqData } from '../../types';
import { ErrorObject, ResolveData } from '../utils';

export interface Do3DS2ChallengeProps {
    acsURL: string;
    cReqData: CReqData;
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
    onComplete?: (data: ResolveData) => void;
    onError?: (error: string | ErrorObject) => void;
    paymentData?: string;
    size?: string;
    type?: string;
}

export interface ThreeDS2ChallengeState {
    challengeData?: ChallengeData;
    status?: string;
}
