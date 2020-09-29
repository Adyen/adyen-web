import { ChallengeObject, FingerPrintData } from '../../types';
import { ThreeDS2DeviceFingerprintElementProps } from '../../ThreeDS2DeviceFingerprint';

export interface GetFingerprint3DS2Props extends FingerPrintData {
    onCompleteFingerprint: (resolveObject: ChallengeObject) => void;
    onErrorFingerprint: (rejectObject: ChallengeObject) => void;
    showSpinner: boolean;
}

export interface GetFingerprint3DS2State {
    base64URLencodedData: string;
}

export interface PrepareFingerprint3DS2Props extends ThreeDS2DeviceFingerprintElementProps {
    onComplete: (data?) => void;
}

export interface PrepareFingerprint3DS2State {
    status?: string;
    fingerPrintData?: FingerPrintData;
}
