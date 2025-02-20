import { PasskeySdkLoader } from './PasskeySdkLoader';
import { PasskeyServiceConfig, IPasskeyService, IPasskeyWindowObject } from './types';
import AdyenCheckoutError, { SCRIPT_ERROR } from '../../../core/Errors/AdyenCheckoutError';
import Storage from '../../../utils/Storage';

export default class PasskeyService implements IPasskeyService {
    private readonly storage: Storage<string> = new Storage('deviceId', 'localStorage');
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
        return new Promise<PasskeyService>((resolve, reject) => {
            void new PasskeySdkLoader()
                .load(this.passkeyServiceConfig.environment)
                .then(passkey => {
                    this.passkey = passkey;
                    resolve(this);
                })
                .catch(error => {
                    reject(new AdyenCheckoutError(SCRIPT_ERROR, error.message ?? 'Failed to load passkey'));
                });
        });
    }

    getRiskSignalsEnrollment() {
        return this.passkey.captureRiskSignalsEnrollment(this.deviceId);
    }

    getRiskSignalsAuthentication() {
        return this.passkey.captureRiskSignalsAuthentication(this.deviceId);
    }

    get deviceId() {
        return this.passkeyServiceConfig.deviceId;
    }

    public async createEnrollment(enrollment) {
        const enrollmentCredential = await this.createCredentialForEnrollment(enrollment);
        console.log({ enrollmentCredential });
        // todo: call backend to post the enrollment
        return { action: {} };
    }

    public async makeStoredPayment() {
        //todo: to add
    }

    private createCredentialForEnrollment(credentialCreationOptions: PublicKeyCredentialCreationOptions) {
        return this.passkey.createCredentialForEnrollment(credentialCreationOptions);
    }

    private authenticateWithCredential(credentialRequestOptions: PublicKeyCredentialRequestOptions) {
        return this.passkey.authenticateWithCredential(credentialRequestOptions);
    }

    /*    private restoreOrGenerateDeviceId(): string {
        let deviceId = this.storage.get();
        if (!deviceId) {
            deviceId = uuidv4();
            this.storage.set(deviceId);
        }
        return deviceId;
    }*/
}
