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

    get deviceId() {
        return this.passkeyServiceConfig.deviceId;
    }

    public static async getWebAuthnUnsupportedReason(): Promise<string> {
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

    constructor(configuration: PasskeyServiceConfig) {
        this.passkeyServiceConfig = configuration;
    }

    public initialize() {
        return new Promise<PasskeyService>((resolve, reject) => {
            void new PasskeySdkLoader()
                .load(this.passkeyServiceConfig.environment)
                .then(passkey => {
                    this.passkeySdk = passkey;
                    resolve(this);
                })
                .catch((error: AdyenCheckoutError) => {
                    reject(error);
                });
        });
    }

    public async captureRiskSignalsEnrollment(): Promise<RiskSignalsEnrollment> {
        const result = await this.passkeySdk.captureRiskSignalsEnrollment(this.deviceId);
        if (result && 'type' in result && result.type === PasskeyErrorTypes.RISK_SIGNALS_ERROR) {
            throw new AdyenCheckoutError(SDK_ERROR, result.message);
        }
        return result as RiskSignalsEnrollment;
    }

    public async captureRiskSignalsAuthentication(): Promise<RiskSignalsAuthentication> {
        const result = await this.passkeySdk.captureRiskSignalsAuthentication(this.deviceId);
        if (result && 'type' in result && result.type === PasskeyErrorTypes.RISK_SIGNALS_ERROR) {
            throw new AdyenCheckoutError(SDK_ERROR, result.message);
        }
        return result as RiskSignalsAuthentication;
    }

    public async createCredentialForEnrollment(registrationOptions: string): Promise<string> {
        const decodedResult: DecodeObject = base64.decode(registrationOptions);
        if (!decodedResult.success) {
            throw new AdyenCheckoutError(SDK_ERROR, 'Failed to decode enrollment');
        }

        const result = await this.passkeySdk.createCredentialForEnrollment(JSON.parse(decodedResult.data));
        if (result && 'type' in result && result.type === PasskeyErrorTypes.CREDENTIAL_CREATION_ERROR) {
            throw new AdyenCheckoutError(SDK_ERROR, (result as NavigatorCredentialCreationsError).message);
        }
        return base64.encode(JSON.stringify(result));
    }

    public async authenticateWithCredential(authenticationOptions: string): Promise<string> {
        const decodedResult: DecodeObject = base64.decode(authenticationOptions);
        if (!decodedResult.success) {
            throw new AdyenCheckoutError(SDK_ERROR, 'Failed to decode authenticationOptions');
        }

        const result = await this.passkeySdk.authenticateWithCredential(JSON.parse(decodedResult.data));
        if (result && 'type' in result && result.type === PasskeyErrorTypes.CREDENTIAL_RETRIEVAL_ERROR) {
            throw new AdyenCheckoutError(SDK_ERROR, (result as NavigatorCredentialRetrievalError).message);
        }
        return base64.encode(JSON.stringify(result));
    }
}
