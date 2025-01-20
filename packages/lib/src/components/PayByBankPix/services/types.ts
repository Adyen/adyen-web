export interface IPasskeyWindowObject {
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
