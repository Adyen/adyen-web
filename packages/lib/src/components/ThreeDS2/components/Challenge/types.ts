import { ChallengeData, ChallengeObject } from '../../types';
import { ResolveData } from '../utils';
import { ThreeDS2ChallengeProps } from '../../ThreeDS2Challenge';

export interface DoChallenge3DS2Props extends ChallengeData {
    onCompleteChallenge: (resolveObject: ChallengeObject) => void;
    onErrorChallenge: (rejectObject: ChallengeObject) => void;
}

export interface DoChallenge3DS2State {
    base64URLencodedData?: string;
    status?: string;
}

export interface PrepareChallenge3DS2Props extends ThreeDS2ChallengeProps {
    onComplete?: (data: ResolveData) => void;
}

export interface PrepareChallenge3DS2State {
    challengeData?: ChallengeData;
    status?: string;
}
