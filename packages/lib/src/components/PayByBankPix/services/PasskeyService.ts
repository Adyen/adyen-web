import { PasskeySdkLoader } from './PasskeySdkLoader';
import { PasskeyServiceConfig, IPasskeyService, IPasskeyWindowObject } from './types';

export class PasskeyService implements IPasskeyService {
    private passkey: IPasskeyWindowObject;
    private readonly passkeyServiceConfig: PasskeyServiceConfig;

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
        return new Promise<PasskeyService>(resolve => {
            void new PasskeySdkLoader()
                .load(this.passkeyServiceConfig.environment)
                .then(passkey => {
                    this.passkey = passkey;
                    resolve(this);
                })
                .catch(() => {
                    resolve(this);
                    // todo: uncomment this!
                    //reject(new AdyenCheckoutError(SCRIPT_ERROR, error.message ?? 'Failed to load passkey'));
                });
        });
    }

    // @ts-ignore todo remove the mock resolution
    public getRiskSignalsEnrollment() {
        return Promise.resolve({ deviceId: 1111 });
        //return this.passkey.captureRiskSignalsEnrollment(this.deviceId);
    }

    public getRiskSignalsAuthentication() {
        return this.passkey.captureRiskSignalsAuthentication(this.deviceId);
    }

    get deviceId() {
        return this.passkeyServiceConfig.deviceId;
    }

    public createCredentialForEnrollment(credentialCreationOptions: PublicKeyCredentialCreationOptions) {
        return this.passkey.createCredentialForEnrollment(credentialCreationOptions);
    }

    public authenticateWithCredential(credentialRequestOptions: PublicKeyCredentialRequestOptions) {
        return this.passkey.authenticateWithCredential(credentialRequestOptions);
    }
}
