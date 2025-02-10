import { PasskeySdkLoader } from './PasskeySdkLoader';
import { PasskeyServiceConfig, IPasskeyService, IPasskeyWindowObject } from './types';
import AdyenCheckoutError, { SCRIPT_ERROR } from '../../../core/Errors/AdyenCheckoutError';
import Storage from '../../../utils/Storage';
import uuidv4 from '../../../utils/uuid';

export default class PasskeyService implements IPasskeyService {
    private readonly storage: Storage<string> = new Storage('deviceId', 'localStorage');
    private passkey: IPasskeyWindowObject;
    private readonly _deviceId: string;

    constructor(configuration: PasskeyServiceConfig) {
        try {
            this._deviceId = configuration?.deviceId ?? this.restoreOrGenerateDeviceId();
            void new PasskeySdkLoader().load().then(passkey => {
                this.passkey = passkey;
            });
        } catch (e) {
            throw new AdyenCheckoutError(SCRIPT_ERROR, 'Passkey sdk fails to load.');
        }
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

    get biometrics() {
        return this.passkey.biometrics;
    }

    get riskSignals() {
        return this.passkey.riskSignals;
    }

    get deviceId() {
        return this._deviceId;
    }

    private restoreOrGenerateDeviceId(): string {
        let deviceId = this.storage.get();
        if (!deviceId) {
            deviceId = uuidv4();
            this.storage.set(deviceId);
        }
        return deviceId;
    }
}
