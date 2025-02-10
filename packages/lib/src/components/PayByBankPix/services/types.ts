type RiskSignals = {
    deviceId: string;
    osVersion?: string;
    userTimeZoneOffset?: number;
    language?: string;
    screenDimensions?: { width: number; height: number };
};

export interface IPasskeyWindowObject {
    captureRiskSignalsEnrollment: (deviceId?: string) => Promise<RiskSignals>;
    captureRiskSignalsAuthentication: (deviceId: string) => Promise<RiskSignals>;
    // todo better typing the response
    createCredentialForEnrollment: (credentialCreationOptions: PublicKeyCredentialCreationOptions) => Promise<any>;
    authenticateWithCredential: (credentialRequestOptions: PublicKeyCredentialRequestOptions) => Promise<any>;

    get biometrics(): Promise<object>;
    get riskSignals(): Promise<object>;
}

export interface IPasskeyService {
    get biometrics(): Promise<object>;
    get riskSignals(): Promise<object>;
}

export type PasskeyServiceConfig = {
    clientId: string;
    deviceId?: string; // from merchant
    environment: string;
};
