import { ChallengeData, ThreeDS2FlowObject } from '../../types';
import { ChallengeResolveData } from '../utils';
import { ThreeDS2ChallengeProps } from '../../ThreeDS2Challenge';
import { ActionHandledReturnObject } from '../../../types';
import { SendAnalyticsObject } from '../../../../core/Analytics/types';
import { ErrorObject } from '../../../../core/Errors/types';

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

export interface PrepareChallenge3DS2Props extends ThreeDS2ChallengeProps {
    onComplete?: (data: ChallengeResolveData) => void;
    onSubmitAnalytics: (aObj: SendAnalyticsObject) => void;
    isMDFlow: boolean;
}

export interface PrepareChallenge3DS2State {
    challengeData?: ChallengeData | ErrorObject;
    status?: string;
    errorInfo?: string;
}
