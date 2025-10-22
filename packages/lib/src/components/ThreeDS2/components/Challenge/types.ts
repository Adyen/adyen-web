import { ChallengeData, ThreeDS2ChallengeConfiguration, ThreeDS2FlowObject, ChallengeResolveData, LegacyChallengeResolveData } from '../../types';
import { ActionHandledReturnObject } from '../../../../types/global-types';
import { ErrorObject } from '../../../../core/Errors/types';
import { AnalyticsEvent } from '../../../../core/Analytics/AnalyticsEvent';

export interface DoChallenge3DS2Props extends ChallengeData {
    onCompleteChallenge: (resolveObject: ThreeDS2FlowObject) => void;
    onErrorChallenge: (rejectObject: ThreeDS2FlowObject) => void;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
    onFormSubmit: (msg: string) => void;
}

export interface DoChallenge3DS2State {
    base64URLencodedData?: string;
    status?: 'init' | 'iframeLoaded';
}

export interface PrepareChallenge3DS2Props extends ThreeDS2ChallengeConfiguration {
    onComplete?: (data: LegacyChallengeResolveData | ChallengeResolveData) => void;
    onSubmitAnalytics: (aObj: AnalyticsEvent) => void;
    environment?: string;
    _environmentUrls?: {
        api?: string;
        analytics?: string;
        cdn?: {
            images?: string;
            translations?: string;
        };
    };
}

export interface PrepareChallenge3DS2State {
    challengeData?: ChallengeData | ErrorObject;
    status?: 'init' | 'performingChallenge' | 'error' | 'complete';
    errorInfo?: string;
}

export interface StatusErrorInfoObject {
    errorInfo: string;
    errorObj?: ChallengeData | ErrorObject;
}
