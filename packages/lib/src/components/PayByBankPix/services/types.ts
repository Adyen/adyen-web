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
}

export interface IPasskeyService {
    getRiskSignalsEnrollment(deviceId?: string): Promise<RiskSignals>;
    createCredentialForEnrollment: (credentialCreationOptions: PublicKeyCredentialCreationOptions) => Promise<any>;
    getRiskSignalsAuthentication(deviceId: string): Promise<RiskSignals>;
    authenticateWithCredential: (credentialRequestOptions: PublicKeyCredentialRequestOptions) => Promise<any>;
}

export type PasskeyServiceConfig = {
    clientId?: string;
    deviceId?: string; // from merchant
    environment: string;
};
