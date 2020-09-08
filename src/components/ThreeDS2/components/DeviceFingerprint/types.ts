import { ChallengeObject, FingerPrintData } from '../../types';

export interface Get3DS2DeviceFingerprintProps {
    methodURL: string;
    serverTransactionID: string;
    threedsMethodNotificationURL: string;
    postMessageDomain: string;
    onCompleteFingerprint: (resolveObject: ChallengeObject) => void;
    onErrorFingerprint: (rejectObject: ChallengeObject) => void;
    showSpinner?: boolean;
}

export interface Get3DS2DeviceFingerprintState {
    base64URLencodedData: string;
}

export interface ThreeDS2DeviceFingerprintProps {
    dataKey: string;
    fingerprintToken: string;
    notificationURL: string;
    onComplete: (data?: object) => void;
    onError: (error?: string | object) => void;
    paymentData: string;
    showSpinner?: boolean;
    type: string;
}

export interface ThreeDS2DeviceFingerprintState {
    status?: string;
    fingerPrintData?: FingerPrintData;
}
