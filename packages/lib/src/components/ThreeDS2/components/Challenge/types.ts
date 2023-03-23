import { ChallengeData, ThreeDS2FlowObject } from '../../types';
import { ChallengeResolveData } from '../utils';
import { ThreeDS2ChallengeProps } from '../../ThreeDS2Challenge';
import { ActionHandledReturnObject } from '../../../types';

export interface DoChallenge3DS2Props extends ChallengeData {
    onCompleteChallenge: (resolveObject: ThreeDS2FlowObject) => void;
    onErrorChallenge: (rejectObject: ThreeDS2FlowObject) => void;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
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
    errorInfo?: string;
}
