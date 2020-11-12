import { ThreeDS2FlowObject, FingerPrintData } from '../../types';
import { ThreeDS2DeviceFingerprintProps } from '../../ThreeDS2DeviceFingerprint';

export interface DoFingerprint3DS2Props extends FingerPrintData {
    onCompleteFingerprint: (resolveObject: ThreeDS2FlowObject) => void;
    onErrorFingerprint: (rejectObject: ThreeDS2FlowObject) => void;
    showSpinner: boolean;
}

export interface DoFingerprint3DS2State {
    base64URLencodedData: string;
}

export interface PrepareFingerprint3DS2Props extends ThreeDS2DeviceFingerprintProps {
    onComplete: (data?) => void;
}

export interface PrepareFingerprint3DS2State {
    status?: string;
    fingerPrintData?: FingerPrintData;
}
