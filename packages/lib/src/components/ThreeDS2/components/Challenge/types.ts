import { ChallengeData, ThreeDS2FlowObject } from '../../types';
import { ChallengeResolveData } from '../utils';
import { ThreeDS2ChallengeProps } from '../../ThreeDS2Challenge';

export interface DoChallenge3DS2Props extends ChallengeData {
    onCompleteChallenge: (resolveObject: ThreeDS2FlowObject) => void;
    onErrorChallenge: (rejectObject: ThreeDS2FlowObject) => void;
    threeDS2MDFlowUnloadListener?: (event: any) => any;
}

export interface DoChallenge3DS2State {
    base64URLencodedData?: string;
    status?: string;
}

export interface PrepareChallenge3DS2Props extends ThreeDS2ChallengeProps {
    onComplete?: (data: ChallengeResolveData) => void;
}

export interface PrepareChallenge3DS2State {
    challengeData?: ChallengeData;
    status?: string;
}
