import { ChallengeData, ThreeDS2ChallengeConfiguration, ThreeDS2FlowObject } from '../../types';
import { ChallengeResolveData } from '../utils';
import { ActionHandledReturnObject } from '../../../../types/global-types';
import { SendAnalyticsObject } from '../../../../core/Analytics/types';

export interface DoChallenge3DS2Props extends ChallengeData {
    onCompleteChallenge: (resolveObject: ThreeDS2FlowObject) => void;
    onErrorChallenge: (rejectObject: ThreeDS2FlowObject) => void;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
    onFormSubmit: (msg: string) => void;
}

export interface DoChallenge3DS2State {
    base64URLencodedData?: string;
    status?: string;
}

export interface PrepareChallenge3DS2Props extends ThreeDS2ChallengeConfiguration {
    onComplete?: (data: ChallengeResolveData) => void;
    onSubmitAnalytics: (aObj: SendAnalyticsObject) => void;
}

export interface PrepareChallenge3DS2State {
    challengeData?: ChallengeData;
    status?: string;
    errorInfo?: string;
}
