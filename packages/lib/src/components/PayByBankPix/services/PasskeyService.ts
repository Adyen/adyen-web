import { PasskeySdkLoader } from './PasskeySdkLoader';
import {
    PasskeyServiceConfig,
    IPasskeyService,
    IAdyenPasskey,
    PasskeyErrorTypes,
    RiskSignalsEnrollment,
    RiskSignalsAuthentication,
    NavigatorCredentialCreationsError,
    NavigatorCredentialRetrievalError
} from './types';
import AdyenCheckoutError, { SDK_ERROR } from '../../../core/Errors/AdyenCheckoutError';
import { DecodeObject } from '../../../types/global-types';
import base64 from '../../../utils/base64';

export class PasskeyService implements IPasskeyService {
    private passkeySdk: IAdyenPasskey;
    private readonly passkeyServiceConfig: PasskeyServiceConfig;
    private riskSignals: RiskSignalsEnrollment | RiskSignalsAuthentication;
    private initialized: Promise<void>;

    constructor(configuration: PasskeyServiceConfig) {
        this.passkeyServiceConfig = configuration;
    }

    get deviceId() {
        return this.passkeyServiceConfig.deviceId;
    }

    public async getWebAuthnUnsupportedReason(): Promise<string> {
        if (!window.PublicKeyCredential) {
            return 'Browser does not support webauthn';
        }
        try {
            const platformAuthenticatorAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            if (!platformAuthenticatorAvailable) {
                return 'Device does not have platform authenticator';
            }
        } catch (e) {
            return 'Unknown error';
        }

        return '';
    }

    public initialize() {
        if (this.initialized == null) {
            this.initialized = new PasskeySdkLoader().load(this.passkeyServiceConfig.environment).then(passkey => {
                this.passkeySdk = passkey;
            });
        }

        return this.initialized;
    }

    public async captureRiskSignalsEnrollment(): Promise<RiskSignalsEnrollment> {
        await this.initialized;
        if (this.riskSignals) {
            // Cache it so we don't create unnecessary entries in the localstorage by calling captureRiskSignalsEnrollment
            return this.riskSignals;
        }

        const result = await this.passkeySdk.captureRiskSignalsEnrollment(this.deviceId);
        if (result && 'type' in result && result.type === PasskeyErrorTypes.RISK_SIGNALS_ERROR) {
            throw new AdyenCheckoutError(SDK_ERROR, result.message);
        }
        this.riskSignals = result as RiskSignalsEnrollment;
        return this.riskSignals;
    }

    public async canUseStoredCredential(): Promise<boolean> {
        try {
            await this.captureRiskSignalsAuthentication();
            return true;
        } catch (error) {
            console.warn(
                `The device is not eligible for stored credential authentication: ${error instanceof Error ? error?.message : 'unknown error'}`
            );
            return false;
        }
    }

    public async captureRiskSignalsAuthentication(): Promise<RiskSignalsAuthentication> {
        await this.initialized;
        const result = await this.passkeySdk.captureRiskSignalsAuthentication(this.deviceId);
        if (result && 'type' in result && result.type === PasskeyErrorTypes.RISK_SIGNALS_ERROR) {
            throw new AdyenCheckoutError(SDK_ERROR, result.message);
        }
        return result as RiskSignalsAuthentication;
    }

    public async createCredentialForEnrollment(registrationOptions: string): Promise<string> {
        await this.initialized;
        const options = this.decodeJsonBase64(registrationOptions, 'Failed to decode registrationOptions');
        const result = await this.passkeySdk.createCredentialForEnrollment(options);
        if (result && 'type' in result && result.type === PasskeyErrorTypes.CREDENTIAL_CREATION_ERROR) {
            throw new AdyenCheckoutError(SDK_ERROR, (result as NavigatorCredentialCreationsError).message);
        }
        return base64.encode(JSON.stringify(result));
    }

    public async authenticateWithCredential(authenticationOptions: string): Promise<string> {
        await this.initialized;
        const options = this.decodeJsonBase64(authenticationOptions, 'Failed to decode authenticationOptions');
        const result = await this.passkeySdk.authenticateWithCredential(options);
        if (result && 'type' in result && result.type === PasskeyErrorTypes.CREDENTIAL_RETRIEVAL_ERROR) {
            throw new AdyenCheckoutError(SDK_ERROR, (result as NavigatorCredentialRetrievalError).message);
        }
        return base64.encode(JSON.stringify(result));
    }

    private decodeJsonBase64(encoded: string, errorMessage: string) {
        const decoded: DecodeObject = base64.decode(encoded);
        if (!decoded.success) {
            throw new AdyenCheckoutError(SDK_ERROR, errorMessage);
        }
        return JSON.parse(decoded.data);
    }
}
