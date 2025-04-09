import { PasskeyService } from './PasskeyService';
import { PasskeySdkLoader } from './PasskeySdkLoader';
import AdyenCheckoutError, { SDK_ERROR } from '../../../core/Errors/AdyenCheckoutError';
import { mockDeep } from 'jest-mock-extended';
import { IAdyenPasskey, PasskeyErrorTypes } from './types';
import base64 from '../../../utils/base64';

jest.mock('./PasskeySdkLoader');
beforeAll(() => {
    // @ts-ignore it's ok to ignore for the mocking purpose
    global.window.PublicKeyCredential = {
        isUserVerifyingPlatformAuthenticatorAvailable: jest.fn().mockResolvedValue(true)
    };
});

describe('PasskeyService', () => {
    const mockPasskeySdk = mockDeep<IAdyenPasskey>();
    const mockPasskeyServiceConfig = { environment: 'test', deviceId: 'test-device-id' };

    let passkeyService: PasskeyService;

    beforeEach(() => {
        passkeyService = new PasskeyService(mockPasskeyServiceConfig);
        jest.clearAllMocks();
    });

    it('should initialize successfully', async () => {
        const mockLoader = PasskeySdkLoader as jest.MockedClass<typeof PasskeySdkLoader>;
        mockLoader.prototype.load.mockResolvedValue(mockPasskeySdk);
        await expect(passkeyService.initialize()).resolves.toBe(passkeyService);
        expect(mockLoader.prototype.load).toHaveBeenCalledWith(mockPasskeyServiceConfig.environment);
    });

    it('should reject if initialize fails', async () => {
        const mockLoader = PasskeySdkLoader as jest.MockedClass<typeof PasskeySdkLoader>;
        mockLoader.prototype.load.mockRejectedValue(new AdyenCheckoutError(SDK_ERROR, 'SDK load failed'));
        await expect(passkeyService.initialize()).rejects.toThrow(AdyenCheckoutError);
    });

    it('should return empty string when WebAuthn is supported', async () => {
        const reason = await passkeyService.getWebAuthnUnsupportedReason();
        expect(reason).toBe('');
    });

    it('should return correct unsupported reason if WebAuthn is unsupported', async () => {
        // @ts-ignore it's ok to ignore for the mocking purpose
        global.window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(false);
        const reason = await passkeyService.getWebAuthnUnsupportedReason();
        expect(reason).toBe('Device does not have platform authenticator');
    });

    describe('Passkey sdk functions', () => {
        beforeEach(async () => {
            const mockLoader = PasskeySdkLoader as jest.MockedClass<typeof PasskeySdkLoader>;
            mockLoader.prototype.load.mockResolvedValue(mockPasskeySdk);
            await passkeyService.initialize();
        });

        it('should call captureRiskSignalsEnrollment successfully', async () => {
            const mockEnrollment = { deviceId: 'mocked-device', osVersion: 'OS' };
            // @ts-ignore mocking purpose
            mockPasskeySdk.captureRiskSignalsEnrollment.mockResolvedValue(mockEnrollment);

            const result = await passkeyService.captureRiskSignalsEnrollment();

            expect(result).toEqual(mockEnrollment);
            expect(mockPasskeySdk.captureRiskSignalsEnrollment).toHaveBeenCalledWith(mockPasskeyServiceConfig.deviceId);
        });

        it('should throw an error in captureRiskSignalsEnrollment if the result is a risk signals error', async () => {
            const mockError = { type: PasskeyErrorTypes.RISK_SIGNALS_ERROR, message: 'Risk signal error' };
            mockPasskeySdk.captureRiskSignalsEnrollment.mockResolvedValue(mockError);

            await expect(passkeyService.captureRiskSignalsEnrollment()).rejects.toThrow(new AdyenCheckoutError(SDK_ERROR, 'Risk signal error'));
        });

        it('should return authentication risk signal when successful', async () => {
            const mockAuthSignal = { deviceId: 'mocked-device', userTimeZoneOffset: 0 };
            // @ts-ignore mocking purpose
            mockPasskeySdk.captureRiskSignalsAuthentication.mockResolvedValue(mockAuthSignal);

            const result = await passkeyService.captureRiskSignalsAuthentication();

            expect(result).toEqual(mockAuthSignal);
            expect(mockPasskeySdk.captureRiskSignalsAuthentication).toHaveBeenCalledWith(mockPasskeyServiceConfig.deviceId);
        });

        it('should throw an error if captureRiskSignalsAuthentication returns an error', async () => {
            const mockError = { type: PasskeyErrorTypes.RISK_SIGNALS_ERROR, message: 'Authentication error' };
            mockPasskeySdk.captureRiskSignalsAuthentication.mockResolvedValue(mockError);

            await expect(passkeyService.captureRiskSignalsAuthentication()).rejects.toThrow(
                new AdyenCheckoutError(SDK_ERROR, 'Authentication error')
            );
        });

        it('should successfully create a credential for enrollment', async () => {
            const mockResponse = { credential: 'mocked-credential' };
            const encodedOptions = base64.encode(JSON.stringify({ options: 'someOptions' }));
            // @ts-ignore mocking purpose
            mockPasskeySdk.createCredentialForEnrollment.mockResolvedValue(mockResponse);

            const result = await passkeyService.createCredentialForEnrollment(encodedOptions);

            expect(result).toBe(base64.encode(JSON.stringify(mockResponse)));
            expect(mockPasskeySdk.createCredentialForEnrollment).toHaveBeenCalledWith({
                options: 'someOptions'
            });
        });

        it('should throw an error if credential creation fails', async () => {
            const mockError = { type: PasskeyErrorTypes.CREDENTIAL_CREATION_ERROR, message: 'Failed to create credential' };
            mockPasskeySdk.createCredentialForEnrollment.mockResolvedValue(mockError);

            const encodedOptions = base64.encode(JSON.stringify({ options: 'someOptions' }));

            await expect(passkeyService.createCredentialForEnrollment(encodedOptions)).rejects.toThrow(
                new AdyenCheckoutError(SDK_ERROR, 'Failed to create credential')
            );
        });

        it('should successfully authenticate with a credential', async () => {
            const mockResponse = { authenticated: true };
            const encodedOptions = base64.encode(JSON.stringify({ options: 'authOptions' }));
            // @ts-ignore mocking purpose
            mockPasskeySdk.authenticateWithCredential.mockResolvedValue(mockResponse);

            const result = await passkeyService.authenticateWithCredential(encodedOptions);

            expect(result).toBe(base64.encode(JSON.stringify(mockResponse)));
            expect(mockPasskeySdk.authenticateWithCredential).toHaveBeenCalledWith({
                options: 'authOptions'
            });
        });

        it('should throw an error if authentication fails', async () => {
            const mockError = { type: PasskeyErrorTypes.CREDENTIAL_RETRIEVAL_ERROR, message: 'Failed to authenticate' };
            mockPasskeySdk.authenticateWithCredential.mockResolvedValue(mockError);

            const encodedOptions = base64.encode(JSON.stringify({ options: 'authOptions' }));

            await expect(passkeyService.authenticateWithCredential(encodedOptions)).rejects.toThrow(
                new AdyenCheckoutError(SDK_ERROR, 'Failed to authenticate')
            );
        });
    });
});
