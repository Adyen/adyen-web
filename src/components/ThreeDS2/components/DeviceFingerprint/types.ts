import { ChallengeObject, FingerPrintData } from '../../types';
import { ThreeDS2DeviceFingerprintElementProps } from '../../ThreeDS2DeviceFingerprint';

export interface Get3DS2DeviceFingerprintProps extends FingerPrintData {
    onCompleteFingerprint: (resolveObject: ChallengeObject) => void;
    onErrorFingerprint: (rejectObject: ChallengeObject) => void;
    showSpinner: boolean;
}

export interface Get3DS2DeviceFingerprintState {
    base64URLencodedData: string;
}

export interface ThreeDS2DeviceFingerprintProps extends ThreeDS2DeviceFingerprintElementProps {
    onComplete: (data?) => void;
}

export interface ThreeDS2DeviceFingerprintState {
    status?: string;
    fingerPrintData?: FingerPrintData;
}
