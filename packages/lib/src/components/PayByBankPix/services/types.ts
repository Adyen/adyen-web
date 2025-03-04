interface BrowserRiskSignals {
    osVersion: string;
    userTimeZoneOffset: number;
    language: string;
    screenDimensions: ScreenDimensions;
}

interface ScreenDimensions {
    width: number;
    height: number;
}

type RiskSignalsError = {
    type: typeof PasskeyErrorTypes.RISK_SIGNALS_ERROR;
    message: string;
};

type ConfidenceScore = {
    score: number;
    errors?: string[];
};

interface PublicKeyCredentialCreationOptionsDTO {
    enrollmentId: string;
    challenge: string;
    rp: {
        name: string;
        id: string;
    };
    user: {
        id: string;
        name: string;
        displayName: string;
    };
    pubKeyCredParams: { alg: number; type: string }[];
    timeout?: number;
    attestation: string;
    excludeCredentials: string[];
    authenticatorSelection?: {
        authenticatorAttachment: string;
        residentKey: string;
        userVerification: string;
        requireResidentKey: boolean;
    };
    extensions?: {
        credProps?: boolean;
    };
}

interface WebAuthnPublicKeyCreationCredential extends Omit<PublicKeyCredential, 'response'> {
    id: string;
    response: AuthenticatorAttestationResponse;
}

interface PublicKeyCredentialRequestOptionsDTO {
    challenge: string;
    allowCredentials?: { id: string; type: string }[];
    timeout: number;
    userVerification: string;
    rpId: string;
}

interface WebAuthnPublicKeyPaymentCredential extends Omit<PublicKeyCredential, 'response'> {
    response: AuthenticatorAssertionResponse;
}

export const PasskeyErrorTypes = {
    CREDENTIAL_CREATION_ERROR: 'Navigator.credentials creation error',
    CREDENTIAL_RETRIEVAL_ERROR: 'Navigator.credentials retrieval error',
    RISK_SIGNALS_ERROR: 'Error capturing Risk Signals'
};

export interface RiskSignalsEnrollment extends BrowserRiskSignals {
    deviceId: string;
}

export interface RiskSignalsAuthentication extends BrowserRiskSignals {
    deviceId: string;
    confidenceScore: ConfidenceScore;
}

export type NavigatorCredentialCreationsError = {
    type: typeof PasskeyErrorTypes.CREDENTIAL_CREATION_ERROR;
    message: string;
};

export type NavigatorCredentialRetrievalError = {
    type: typeof PasskeyErrorTypes.CREDENTIAL_RETRIEVAL_ERROR;
    message: string;
};

export interface IAdyenPasskey {
    captureRiskSignalsEnrollment: (deviceId?: string) => Promise<RiskSignalsEnrollment | RiskSignalsError>;
    captureRiskSignalsAuthentication: (deviceId: string) => Promise<RiskSignalsAuthentication | RiskSignalsError>;
    createCredentialForEnrollment: (
        creationData: PublicKeyCredentialCreationOptionsDTO
    ) => Promise<WebAuthnPublicKeyCreationCredential | NavigatorCredentialCreationsError>;
    authenticateWithCredential: (
        retrievalData: PublicKeyCredentialRequestOptionsDTO
    ) => Promise<WebAuthnPublicKeyPaymentCredential | NavigatorCredentialRetrievalError>;
}

export interface IPasskeyService {
    captureRiskSignalsEnrollment(): Promise<RiskSignalsEnrollment>;
    captureRiskSignalsAuthentication(): Promise<RiskSignalsAuthentication>;
    /**
     *
     * @param registrationOptions - registration options object encoded in base64
     * @returns fido assertion result encoded in base64
     */
    createCredentialForEnrollment: (registrationOptions: string) => Promise<string>;
    /**
     *
     * @param authenticationOptions - encoded in base64
     * @returns result encoded in base64
     */
    authenticateWithCredential: (authenticationOptions: string) => Promise<string>;
}

export type PasskeyServiceConfig = {
    deviceId?: string; // Merchant optionally pass
    environment: string;
};
