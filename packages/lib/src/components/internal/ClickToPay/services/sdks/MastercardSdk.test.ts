import MastercardSdk from './MastercardSdk';
import Script from '../../../../../utils/Script';
import { MC_SDK_PROD, MC_SDK_TEST } from './config';

const mockScriptLoaded = jest.fn().mockImplementation(() => {
    window.SRCSDK_MASTERCARD = {
        init: jest.fn().mockResolvedValue(() => {}),
        identityLookup: jest.fn().mockResolvedValue({ consumerPresent: true }),
        completeIdentityValidation: jest.fn().mockResolvedValue({ idToken: 'id-token' }),
        unbindAppInstance: jest.fn(),
        initiateIdentityValidation: jest.fn().mockResolvedValue({ maskedValidationChannel: '+31*******55' }),
        isRecognized: jest.fn().mockResolvedValue({
            recognized: 'true',
            idTokens: ['id-token']
        }),
        checkout: jest.fn().mockResolvedValue({
            dcfActionCode: 'COMPLETE',
            checkoutResponse: 'checkout-response'
        }),
        getSrcProfile: jest.fn().mockResolvedValue({
            srcCorrelationId: '1a2b3c',
            profiles: [
                {
                    maskedCards: [
                        {
                            srcDigitalCardId: 'yyyy',
                            panLastFour: '4302',
                            dateOfCardLastUsed: '2019-12-25T20:20:02.942Z',
                            paymentCardDescriptor: 'mc',
                            panExpirationMonth: '12',
                            panExpirationYear: '2020',
                            digitalCardData: {
                                descriptorName: 'Mastercard',
                                artUri: 'https://image.com/mc'
                            },
                            tokenId: '2a2a3b3b'
                        }
                    ]
                }
            ]
        })
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
    delete window.SRCSDK_MASTERCARD;
});

describe('SDK urls', () => {
    test('should load sdk script with correct URL for live', async () => {
        const sdk = new MastercardSdk('live', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        expect(sdk.schemeSdk).toBeNull;
        expect(sdk.schemeName).toBe('mc');

        await sdk.loadSdkScript();

        expect(Script).toHaveBeenCalledWith(MC_SDK_PROD);
        expect(mockScriptLoaded).toHaveBeenCalledTimes(1);
    });

    test('should load sdk script with correct URL for test', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        expect(Script).toHaveBeenCalledWith(MC_SDK_TEST);
        expect(mockScriptLoaded).toHaveBeenCalledTimes(1);
    });
});

describe('init()', () => {
    test('should init with the correct values', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const srcInitiatorId = 'xxxx-yyyy';
        const srciDpaId = '123456';
        const srciTransactionId = '99999999';

        await sdk.init({ srciDpaId, srcInitiatorId }, srciTransactionId);

        expect(sdk.schemeSdk.init).toHaveBeenCalledWith({
            dpaData: {
                dpaPresentationName: 'MyStore'
            },
            dpaTransactionOptions: {
                confirmPayment: false,
                consumerNameRequested: true,
                customInputData: {
                    'com.mastercard.dcfExperience': 'PAYMENT_SETTINGS'
                },
                dpaLocale: 'en-US',
                paymentOptions: {
                    dynamicDataType: 'CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM'
                }
            },
            srcInitiatorId: 'xxxx-yyyy',
            srciDpaId: '123456',
            srciTransactionId: '99999999'
        });
    });

    test('should trigger error if init fails', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const mcError = {
            message: 'Something went wrong',
            reason: 'FAILED'
        };

        sdk.schemeSdk.init = jest.fn().mockRejectedValue(mcError);

        expect.assertions(4);

        await sdk.init({ srciDpaId: 'dpa-id', srcInitiatorId: 'initiator-id' }, 'transaction-id').catch(error => {
            expect(error.scheme).toBe('mc');
            expect(error.source).toBe('init');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('identityLookup()', () => {
    test('should call identityLookup with the correct values', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const response = await sdk.identityLookup({ identityValue: 'john@example.com', type: 'email' });

        expect(response.consumerPresent).toBeTruthy();
        expect(sdk.schemeSdk.identityLookup).toHaveBeenCalledWith({
            consumerIdentity: {
                identityValue: 'john@example.com',
                identityType: 'EMAIL_ADDRESS'
            }
        });
    });

    test('should trigger error if identityLookup fails', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const mcError = {
            message: 'Something went wrong',
            reason: 'FAILED'
        };

        sdk.schemeSdk.identityLookup = jest.fn().mockRejectedValue(mcError);

        expect.assertions(4);

        await sdk.identityLookup({ identityValue: 'test@example.com', type: 'email' }).catch(error => {
            expect(error.scheme).toBe('mc');
            expect(error.source).toBe('identityLookup');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('completeIdentityValidation()', () => {
    test('should call completeIdentityValidation with the correct values', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const otp = '123456';

        const response = await sdk.completeIdentityValidation(otp);

        expect(response.idToken).toBeDefined();
        expect(sdk.schemeSdk.completeIdentityValidation).toHaveBeenCalledWith({
            validationData: otp
        });
    });

    test('should trigger error if completeIdentityValidation fails', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const mcError = {
            message: 'Something went wrong',
            reason: 'FAILED'
        };

        sdk.schemeSdk.completeIdentityValidation = jest.fn().mockRejectedValue(mcError);

        expect.assertions(4);

        await sdk.completeIdentityValidation('123456').catch(error => {
            expect(error.scheme).toBe('mc');
            expect(error.source).toBe('completeIdentityValidation');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('checkout()', () => {
    test('should call checkout with the correct values', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const response = await sdk.checkout({
            srcDigitalCardId: 'digital-id',
            srcCorrelationId: 'correlation-id',
            complianceSettings: { complianceResources: [{ complianceType: 'REMEMBER_ME', uri: '' }] }
        });

        expect(response.dcfActionCode).toBe('COMPLETE');
        expect(response.checkoutResponse).toBe('checkout-response');
        expect(sdk.schemeSdk.checkout).toHaveBeenCalledWith({
            srcDigitalCardId: 'digital-id',
            srcCorrelationId: 'correlation-id',
            complianceSettings: { complianceResources: [{ complianceType: 'REMEMBER_ME', uri: '' }] }
        });
    });

    test('should trigger error if checkout fails', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const mcError = {
            message: 'Something went wrong',
            reason: 'FAILED'
        };

        sdk.schemeSdk.checkout = jest.fn().mockRejectedValue(mcError);

        expect.assertions(4);

        await sdk.checkout({ srcCorrelationId: 'xxx', srcDigitalCardId: 'yyyy' }).catch(error => {
            expect(error.scheme).toBe('mc');
            expect(error.source).toBe('checkout');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('unbindAppInstance()', () => {
    test('should call unbind', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();
        await sdk.unbindAppInstance();

        expect(sdk.schemeSdk.unbindAppInstance).toHaveBeenCalled();
    });

    test('should trigger error if unbindAppInstance fails', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const mcError = {
            message: 'Something went wrong',
            reason: 'FAILED'
        };

        sdk.schemeSdk.unbindAppInstance = jest.fn().mockRejectedValue(mcError);

        expect.assertions(4);

        await sdk.unbindAppInstance().catch(error => {
            expect(error.scheme).toBe('mc');
            expect(error.source).toBe('unbindAppInstance');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('isRecognized()', () => {
    test('should call isRecognized', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const response = await sdk.isRecognized();

        expect(sdk.schemeSdk.isRecognized).toHaveBeenCalledTimes(1);
        expect(response.recognized).toBeTruthy();
        expect(response.idTokens).toBeDefined();
    });

    test('should trigger error if isRecognized fails', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const mcError = {
            message: 'Something went wrong',
            reason: 'FAILED'
        };

        sdk.schemeSdk.isRecognized = jest.fn().mockRejectedValue(mcError);

        expect.assertions(4);

        await sdk.isRecognized().catch(error => {
            expect(error.scheme).toBe('mc');
            expect(error.source).toBe('isRecognized');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('initiateIdentityValidation()', () => {
    test('should call initiateIdentityValidation', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const response = await sdk.initiateIdentityValidation();

        expect(response.maskedValidationChannel).toBe('+31*******55');
        expect(sdk.schemeSdk.initiateIdentityValidation).toHaveBeenCalledTimes(1);
    });

    test('should trigger error if initiateIdentityValidation fails', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const mcError = {
            message: 'Something went wrong',
            reason: 'FAILED'
        };

        sdk.schemeSdk.initiateIdentityValidation = jest.fn().mockRejectedValue(mcError);

        expect.assertions(4);

        await sdk.initiateIdentityValidation().catch(error => {
            expect(error.scheme).toBe('mc');
            expect(error.source).toBe('initiateIdentityValidation');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('getSrcProfile()', () => {
    test('should call getSrcProfile', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const response = await sdk.getSrcProfile(['id-token']);

        expect(response.srcCorrelationId).toBe('1a2b3c');
        expect(response.profiles[0].maskedCards[0]).toBeDefined();
        expect(sdk.schemeSdk.getSrcProfile).toHaveBeenCalledWith({
            idTokens: ['id-token']
        });
    });

    test('should trigger error if getSrcProfile fails', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();

        const mcError = {
            message: 'Something went wrong',
            reason: 'FAILED'
        };

        sdk.schemeSdk.getSrcProfile = jest.fn().mockRejectedValue(mcError);

        expect.assertions(4);

        await sdk.getSrcProfile(['xxxx']).catch(error => {
            expect(error.scheme).toBe('mc');
            expect(error.source).toBe('getSrcProfile');
            expect(error.reason).toBe('FAILED');
            expect(error.message).toBe('Something went wrong');
        });
    });
});

describe('Removing script', () => {
    test('should remove script', async () => {
        const sdk = new MastercardSdk('test', { dpaLocale: 'en-US', dpaPresentationName: 'MyStore' });
        await sdk.loadSdkScript();
        sdk.removeSdkScript();

        expect(mockScriptRemoved).toHaveBeenCalledTimes(1);
    });
});
