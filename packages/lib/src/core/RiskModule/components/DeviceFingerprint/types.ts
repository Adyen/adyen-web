export interface GetDeviceFingerprintProps {
    loadingContext: string;
    dfpURL: string;
    onCompleteFingerprint: (result) => void;
    onErrorFingerprint: (error) => void;
}

export interface DeviceFingerprintProps {
    loadingContext: string;
    onRiskFingerprintComplete: (fingerprint) => void;
    onError: (error) => void;
}

export interface DeviceFingerprintState {
    status: string;
    dfpURL: string;
}
