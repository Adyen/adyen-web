import { ChallengeData, ChallengeObject } from '../../types';
import { ResolveData } from '../utils';
import { ThreeDS2ChallengeElementProps } from '../../ThreeDS2Challenge';

export interface Do3DS2ChallengeProps extends ChallengeData {
    onCompleteChallenge: (resolveObject: ChallengeObject) => void;
    onErrorChallenge: (rejectObject: ChallengeObject) => void;
}

export interface Do3DS2ChallengeState {
    base64URLencodedData?: string;
    status?: string;
}

export interface ThreeDS2ChallengeProps extends ThreeDS2ChallengeElementProps {
    onComplete?: (data: ResolveData) => void;
}

export interface ThreeDS2ChallengeState {
    challengeData?: ChallengeData;
    status?: string;
}
