import VisaSdk from './VisaSdk';
import Script from '../../../../../utils/Script';
import { VISA_SDK_PROD, VISA_SDK_TEST } from './config';
import { VisaError } from './SrciError';

const mockScriptLoaded = jest.fn().mockImplementation(() => {
    window.vAdapters = {
        VisaSRCI: jest.fn().mockImplementation(() => ({
            init: jest.fn().mockResolvedValue(() => {}),
            identityLookup: jest.fn().mockResolvedValue({ consumerPresent: true }),
            completeIdentityValidation: jest.fn().mockResolvedValue({ idToken: 'id-token' })
        }))
    };
});

const mockScriptRemoved = jest.fn();

jest.mock('../../../../../utils/Script', () => {
    return jest.fn().mockImplementation(() => {
        return { load: mockScriptLoaded, remove: mockScriptRemoved };
    });
});

beforeEach(() => {
    // @ts-ignore 'mockClear' is provided by jest.mock
    Script.mockClear();
    mockScriptLoaded.mockClear();
    jest.resetModules();
});

afterEach(() => {
    delete window?.vAdapters?.VisaSRCI;
});

describe('SDK urls', () => {
    test('should load sdk script with correct URL for live', async () => {
        const sdk = new VisaSdk('live', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        expect(sdk.schemeSdk).toBeNull;
        expect(sdk.schemeName).toBe('visa');

        await sdk.loadSdkScript();

        expect(Script).toHaveBeenCalledWith(VISA_SDK_PROD);
        expect(mockScriptLoaded).toHaveBeenCalledTimes(1);
    });

    test('should load sdk script with correct URL for test', async () => {
        const sdk = new VisaSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        expect(Script).toHaveBeenCalledWith(VISA_SDK_TEST);
        expect(mockScriptLoaded).toHaveBeenCalledTimes(1);
    });
});

describe('init()', () => {
    test('should init with the correct values', async () => {
        const sdk = new VisaSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const srcInitiatorId = 'xxxx-yyyy';
        const srciDpaId = '123456';
        const srciTransactionId = '99999999';

        await sdk.init({ srciDpaId, srcInitiatorId }, srciTransactionId);

        expect(sdk.schemeSdk.init).toHaveBeenCalledWith({
            dpaData: { dpaPresentationName: 'MyStore' },
            dpaTransactionOptions: {
                customInputData: { checkoutOrchestrator: 'merchant' },
                dpaLocale: 'en-US',
                payloadTypeIndicator: 'NON_PAYMENT'
            },
            srcInitiatorId: 'xxxx-yyyy',
            srciDpaId: '123456',
            srciTransactionId: '99999999'
        });
    });

    test('should trigger error if init fails', async () => {
        const sdk = new VisaSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const error: VisaError = {
            error: {
                message: 'Something went wrong',
                reason: 'FAILED'
            }
        };

        sdk.schemeSdk.init = jest.fn().mockRejectedValue(error);

        expect.assertions(4);

        await sdk.init({ srciDpaId: 'dpa-id', srcInitiatorId: 'initiator-id' }, 'transaction-id').catch(error => {
            expect(error.scheme).toBe('visa');
            expect(error.source).toBe('init');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('identityLookup()', () => {
    test('should call identityLookup with the correct values', async () => {
        const sdk = new VisaSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const response = await sdk.identityLookup({ identityValue: 'john@example.com', type: 'email' });

        expect(response.consumerPresent).toBeTruthy();
        expect(sdk.schemeSdk.identityLookup).toHaveBeenCalledWith({
            identityValue: 'john@example.com',
            type: 'EMAIL'
        });
    });

    test('should trigger error if identityLookup fails', async () => {
        const sdk = new VisaSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const error: VisaError = {
            error: {
                message: 'Something went wrong',
                reason: 'FAILED'
            }
        };

        sdk.schemeSdk.identityLookup = jest.fn().mockRejectedValue(error);

        expect.assertions(4);

        await sdk.identityLookup({ identityValue: 'test@example.com', type: 'email' }).catch(error => {
            expect(error.scheme).toBe('visa');
            expect(error.source).toBe('identityLookup');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('completeValidation()', () => {
    test('should call completeIdentityValidation with the correct values', async () => {
        const sdk = new VisaSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const otp = '123456';

        const response = await sdk.completeIdentityValidation(otp);

        expect(response.idToken).toBeDefined();
        expect(sdk.schemeSdk.completeIdentityValidation).toHaveBeenCalledWith(otp);
    });

    test('should trigger error if completeIdentityValidation fails', async () => {
        const sdk = new VisaSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const error: VisaError = {
            error: {
                message: 'Something went wrong',
                reason: 'FAILED'
            }
        };

        sdk.schemeSdk.completeIdentityValidation = jest.fn().mockRejectedValue(error);

        expect.assertions(4);

        await sdk.completeIdentityValidation('123456').catch(error => {
            expect(error.scheme).toBe('visa');
            expect(error.source).toBe('completeIdentityValidation');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});
