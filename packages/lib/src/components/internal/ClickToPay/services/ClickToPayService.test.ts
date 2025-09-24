import ClickToPayService, { CtpState } from './ClickToPayService';
import { mock } from 'jest-mock-extended';
import { ISrcSdkLoader } from './sdks/SrcSdkLoader';
import VisaSdk from './sdks/VisaSdk';
import MastercardSdk from './sdks/MastercardSdk';
import { IdentityLookupParams, SchemesConfiguration } from './types';
import { SrciCheckoutResponse, SrciIdentityLookupResponse, SrcProfile } from './sdks/types';
import SrciError from './sdks/SrciError';
import ShopperCard from '../models/ShopperCard';
import TimeoutError from '../errors/TimeoutError';
import { AnalyticsModule } from '../../../../types/global-types';

const mockAnalytics = mock<AnalyticsModule>();

describe('Timeout handling', () => {
    test('should report timeout to Visa SDK passing srciDpaId since correlationId is unavailable', async () => {
        const timeoutError = new TimeoutError({
            source: 'init',
            scheme: 'visa',
            isTimeoutTriggeredBySchemeSdk: false
        });

        const onTimeoutMock = jest.fn();

        const visa = mock<VisaSdk>();
        // @ts-ignore Mocking readonly property
        visa.schemeName = 'visa';
        visa.init.mockRejectedValue(timeoutError);

        const schemesConfig = mock<SchemesConfiguration>();
        schemesConfig.visa.srciDpaId = 'visa-srciDpaId';
        const sdkLoader = mock<ISrcSdkLoader>();
        sdkLoader.load.mockResolvedValue([visa]);

        // @ts-ignore  Mock window.VISA_SDK with the buildClientProfile method
        window.VISA_SDK = {
            buildClientProfile: jest.fn()
        };

        const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics, undefined, onTimeoutMock);
        await service.initialize();

        // @ts-ignore  Mock window.VISA_SDK with the buildClientProfile method
        expect(window.VISA_SDK.buildClientProfile).toHaveBeenNthCalledWith(1, 'visa-srciDpaId');
        expect(onTimeoutMock).toHaveBeenNthCalledWith(1, timeoutError);
    });

    test('should report timeout to Visa SDK without passing srciDpaId because correlationId is available', async () => {
        const timeoutError = new TimeoutError({
            source: 'init',
            scheme: 'visa',
            isTimeoutTriggeredBySchemeSdk: false
        });

        const onTimeoutMock = jest.fn();

        const visa = mock<VisaSdk>();
        // @ts-ignore Mocking readonly property
        visa.schemeName = 'visa';
        visa.init.mockRejectedValue(timeoutError);

        const schemesConfig = mock<SchemesConfiguration>();
        schemesConfig.visa.srciDpaId = 'visa-srciDpaId';
        const sdkLoader = mock<ISrcSdkLoader>();
        sdkLoader.load.mockResolvedValue([visa]);

        // @ts-ignore  Mock window.VISA_SDK with the buildClientProfile method
        window.VISA_SDK = {
            buildClientProfile: jest.fn(),
            correlationId: 'xxx-yyy'
        };

        const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics, undefined, onTimeoutMock);
        await service.initialize();

        // @ts-ignore  Mock window.VISA_SDK with the buildClientProfile method
        expect(window.VISA_SDK.buildClientProfile).toHaveBeenCalledTimes(1);
        // @ts-ignore  Mock window.VISA_SDK with the buildClientProfile method
        expect(window.VISA_SDK.buildClientProfile).toHaveBeenCalledWith();

        expect(onTimeoutMock).toHaveBeenNthCalledWith(1, timeoutError);
    });

    test('should not call Visa buildClientProfile() because it is Mastercard timeout', async () => {
        const timeoutError = new TimeoutError({
            source: 'init',
            scheme: 'mc',
            isTimeoutTriggeredBySchemeSdk: false
        });

        const onTimeoutMock = jest.fn();

        const mc = mock<MastercardSdk>();
        // @ts-ignore Mocking readonly property
        mc.schemeName = 'mc';
        mc.init.mockRejectedValue(timeoutError);

        const schemesConfig = mock<SchemesConfiguration>();
        schemesConfig.mc.srciDpaId = 'mc-srciDpaId';
        const sdkLoader = mock<ISrcSdkLoader>();
        sdkLoader.load.mockResolvedValue([mc]);

        // @ts-ignore  Mock window.VISA_SDK with the buildClientProfile method
        window.VISA_SDK = {
            buildClientProfile: jest.fn()
        };

        const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics, undefined, onTimeoutMock);
        await service.initialize();

        // @ts-ignore  Mock window.VISA_SDK with the buildClientProfile method
        expect(window.VISA_SDK.buildClientProfile).toHaveBeenCalledTimes(0);

        expect(onTimeoutMock).toHaveBeenNthCalledWith(1, timeoutError);
    });
});

test('should be able to tweak the configuration to store the cookie', () => {
    const visa = mock<VisaSdk>();
    const schemesConfig = mock<SchemesConfiguration>();
    const sdkLoader = mock<ISrcSdkLoader>();
    sdkLoader.load.mockResolvedValue([visa]);

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics);
    expect(service.storeCookies).toBe(false);

    service.updateStoreCookiesConsent(true);
    expect(service.storeCookies).toBe(true);

    service.updateStoreCookiesConsent(false);
    expect(service.storeCookies).toBe(false);
});

test('should pass the complianceSettings if the cookie is set to be stored', async () => {
    const checkoutResponseMock = mock<SrciCheckoutResponse>();
    checkoutResponseMock.dcfActionCode = 'COMPLETE';

    const profileFromVisaSrcSystem: SrcProfile = {
        srcCorrelationId: '123456',
        profiles: [
            {
                maskedCards: [
                    {
                        srcDigitalCardId: 'xxxx',
                        panLastFour: '8902',
                        dateOfCardCreated: '2015-01-20T06:00:00.312Z',
                        dateOfCardLastUsed: '2019-09-28T08:10:02.312Z',
                        paymentCardDescriptor: 'visa',
                        panExpirationMonth: '12',
                        panExpirationYear: '2020',
                        digitalCardData: {
                            descriptorName: 'Visa',
                            artUri: 'https://image.com/visa'
                        },
                        tokenId: '9w8e8e'
                    }
                ]
            }
        ]
    };

    const visa = mock<VisaSdk>();
    // @ts-ignore Mocking readonly property
    visa.schemeName = 'visa';
    visa.checkout.mockResolvedValue(checkoutResponseMock);
    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: true, idTokens: ['id-token'] });
    visa.getSrcProfile.mockResolvedValue(profileFromVisaSrcSystem);

    const sdkLoader = mock<ISrcSdkLoader>();
    const schemesConfig = mock<SchemesConfiguration>();

    const shopperCard = mock<ShopperCard>();
    shopperCard.srcDigitalCardId = 'xxxx';
    shopperCard.srcCorrelationId = 'zzzz';
    shopperCard.scheme = 'visa';
    Object.defineProperty(shopperCard, 'isDcfPopupEmbedded', {
        get: jest.fn(() => false)
    });

    sdkLoader.load.mockResolvedValue([visa]);

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics);
    service.updateStoreCookiesConsent(true);

    await service.initialize();
    await service.checkout(shopperCard);

    expect(visa.checkout).toHaveBeenCalledTimes(1);
    expect(visa.checkout).toHaveBeenCalledWith({
        complianceSettings: {
            complianceResources: [
                {
                    complianceType: 'REMEMBER_ME',
                    uri: ''
                }
            ]
        },
        srcCorrelationId: 'zzzz',
        srcDigitalCardId: 'xxxx'
    });
});

test('should pass the correct configuration to the respective scheme SDKs', async () => {
    const visa = mock<VisaSdk>();
    const mc = mock<MastercardSdk>();
    const sdkLoader = mock<ISrcSdkLoader>();

    // @ts-ignore Mocking readonly property
    visa.schemeName = 'visa';
    visa.isRecognized.mockResolvedValue({ recognized: false });

    // @ts-ignore Mocking readonly property
    mc.schemeName = 'mc';
    mc.isRecognized.mockResolvedValue({ recognized: false });

    sdkLoader.load.mockResolvedValue([visa, mc]);

    const schemesConfig: SchemesConfiguration = {
        visa: {
            srcInitiatorId: 'xxxx-yyyy',
            srciDpaId: 'pppp-zzzz'
        },
        mc: {
            srcInitiatorId: '12345-54321',
            srciDpaId: 'abcd-abcd'
        }
    };

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics);
    await service.initialize();

    expect(visa.init.mock.calls[0][0]).toBe(schemesConfig.visa);
    expect(mc.init.mock.calls[0][0]).toBe(schemesConfig.mc);
});

test('should set state to not available if there is no cookie AND no user identity is provided', async () => {
    const visa = mock<VisaSdk>();
    const sdkLoader = mock<ISrcSdkLoader>();
    const schemesConfig = mock<SchemesConfiguration>();

    sdkLoader.load.mockResolvedValue([visa]);

    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: false });

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics);
    await service.initialize();

    expect(service.state).toBe(CtpState.NotAvailable);
});

test('should set state to not available if there is no cookie AND provided shopper identity is not enrolled in the CtP system', async () => {
    const visa = mock<VisaSdk>();
    const sdkLoader = mock<ISrcSdkLoader>();
    const schemesConfig = mock<SchemesConfiguration>();
    const identity: IdentityLookupParams = {
        shopperEmail: 'shopper@email.com'
    };

    sdkLoader.load.mockResolvedValue([visa]);

    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: false });
    visa.identityLookup.mockResolvedValue({ consumerPresent: false });

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics, identity);
    await service.initialize();

    expect(visa.identityLookup).toHaveBeenCalledWith({ identityValue: identity.shopperEmail, type: 'email' });
    expect(service.state).toBe(CtpState.NotAvailable);
});

test('should load shopper cards when cookie is available AND shopper has CtP profile with only ONE scheme', async () => {
    const visa = mock<VisaSdk>();
    const mc = mock<MastercardSdk>();
    const sdkLoader = mock<ISrcSdkLoader>();
    const schemesConfig = mock<SchemesConfiguration>();
    const mockedIdToken = ['xxxx-yyyy'];

    const profileFromVisaSrcSystem: SrcProfile = {
        srcCorrelationId: '123456',
        profiles: [
            {
                maskedCards: [
                    {
                        srcDigitalCardId: 'xxxx',
                        panLastFour: '8902',
                        dateOfCardCreated: '2015-01-20T06:00:00.312Z',
                        dateOfCardLastUsed: '2019-09-28T08:10:02.312Z',
                        paymentCardDescriptor: 'visa',
                        panExpirationMonth: '12',
                        panExpirationYear: '2020',
                        digitalCardData: {
                            descriptorName: 'Visa',
                            artUri: 'https://image.com/visa'
                        },
                        tokenId: '9w8e8e'
                    }
                ]
            }
        ]
    };

    const expectedShopperCards = [
        {
            artUri: 'https://image.com/visa',
            dateOfCardCreated: '2015-01-20T06:00:00.312Z',
            dateOfCardLastUsed: '2019-09-28T08:10:02.312Z',
            descriptorName: 'Visa',
            isExpired: true,
            panExpirationMonth: '12',
            panExpirationYear: '2020',
            panLastFour: '8902',
            scheme: 'visa',
            srcCorrelationId: '123456',
            srcDigitalCardId: 'xxxx',
            tokenId: '9w8e8e'
        }
    ];

    sdkLoader.load.mockResolvedValue([visa, mc]);

    // @ts-ignore Mocking readonly property
    visa.schemeName = 'visa';
    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: true, idTokens: mockedIdToken });
    visa.getSrcProfile.mockResolvedValue(profileFromVisaSrcSystem);

    mc.init.mockResolvedValue();
    mc.isRecognized.mockResolvedValue({ recognized: false });
    mc.getSrcProfile.mockRejectedValue(mock<SrciError>());

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics);
    await service.initialize();

    expect(visa.getSrcProfile).toHaveBeenCalledWith(mockedIdToken);
    expect(service.shopperCards).toEqual(expectedShopperCards);
    expect(service.state).toBe(CtpState.Ready);
});

test('should load shopper cards when cookie is available AND shopper has CtP profile with MULTIPLE schemes', async () => {
    const visa = mock<VisaSdk>();
    const mc = mock<MastercardSdk>();
    const sdkLoader = mock<ISrcSdkLoader>();
    const schemesConfig = mock<SchemesConfiguration>();
    const mockedIdToken = ['xxxx-yyyy'];

    const profileFromVisaSrcSystem: SrcProfile = {
        srcCorrelationId: '123456',
        profiles: [
            {
                maskedCards: [
                    {
                        srcDigitalCardId: 'xxxx',
                        panLastFour: '8902',
                        dateOfCardCreated: '2015-01-20T06:00:00.312Z',
                        dateOfCardLastUsed: '2019-09-28T08:10:02.312Z',
                        paymentCardDescriptor: 'visa',
                        panExpirationMonth: '12',
                        panExpirationYear: '2020',
                        digitalCardData: {
                            descriptorName: 'Visa',
                            artUri: 'https://image.com/visa'
                        },
                        tokenId: '9w8e8e'
                    }
                ]
            }
        ]
    };

    const profileFromMastercardSystem = {
        srcCorrelationId: '1a2b3c',
        profiles: [
            {
                maskedCards: [
                    {
                        srcDigitalCardId: 'yyyy',
                        panLastFour: '4302',
                        dateOfCardCreated: '2015-01-20T06:00:00.312Z',
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
    };

    const expectedShopperCards = [
        {
            artUri: 'https://image.com/mc',
            dateOfCardCreated: '2015-01-20T06:00:00.312Z',
            dateOfCardLastUsed: '2019-12-25T20:20:02.942Z',
            descriptorName: 'Mastercard',
            isExpired: true,
            panExpirationMonth: '12',
            panExpirationYear: '2020',
            panLastFour: '4302',
            scheme: 'mc',
            srcCorrelationId: '1a2b3c',
            srcDigitalCardId: 'yyyy',
            tokenId: '2a2a3b3b'
        },
        {
            artUri: 'https://image.com/visa',
            dateOfCardCreated: '2015-01-20T06:00:00.312Z',
            dateOfCardLastUsed: '2019-09-28T08:10:02.312Z',
            descriptorName: 'Visa',
            isExpired: true,
            panExpirationMonth: '12',
            panExpirationYear: '2020',
            panLastFour: '8902',
            scheme: 'visa',
            srcCorrelationId: '123456',
            srcDigitalCardId: 'xxxx',
            tokenId: '9w8e8e'
        }
    ];

    sdkLoader.load.mockResolvedValue([visa, mc]);

    // @ts-ignore Mocking readonly property
    visa.schemeName = 'visa';
    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: true, idTokens: mockedIdToken });
    visa.getSrcProfile.mockResolvedValue(profileFromVisaSrcSystem);

    // @ts-ignore Mocking readonly property
    mc.schemeName = 'mc';
    mc.init.mockResolvedValue();
    mc.isRecognized.mockResolvedValue({ recognized: false });
    mc.getSrcProfile.mockResolvedValue(profileFromMastercardSystem);

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics);
    await service.initialize();

    expect(visa.getSrcProfile).toHaveBeenCalledWith(mockedIdToken);
    expect(mc.getSrcProfile).toHaveBeenCalledWith(mockedIdToken);
    expect(service.shopperCards).toEqual(expectedShopperCards);
    expect(service.state).toBe(CtpState.Ready);
});

test('should clean up shopper cards and set CtP state as Login after performing the logout', async () => {
    const visa = mock<VisaSdk>();
    const mc = mock<MastercardSdk>();
    const sdkLoader = mock<ISrcSdkLoader>();
    const schemesConfig = mock<SchemesConfiguration>();
    const mockedIdToken = ['xxxx-yyyy'];
    const stateSubscriberFn = jest.fn();

    const profileFromVisaSrcSystem: SrcProfile = {
        srcCorrelationId: '123456',
        profiles: [
            {
                maskedCards: [
                    {
                        srcDigitalCardId: 'xxxx',
                        panLastFour: '8902',
                        dateOfCardCreated: '2015-01-20T06:00:00.312Z',
                        dateOfCardLastUsed: '2019-09-28T08:10:02.312Z',
                        paymentCardDescriptor: 'visa',
                        panExpirationMonth: '12',
                        panExpirationYear: '2020',
                        digitalCardData: {
                            descriptorName: 'Visa',
                            artUri: 'https://image.com/visa'
                        },
                        tokenId: '9w8e8e'
                    }
                ]
            }
        ]
    };

    const expectedShopperCards = [
        {
            artUri: 'https://image.com/visa',
            dateOfCardCreated: '2015-01-20T06:00:00.312Z',
            dateOfCardLastUsed: '2019-09-28T08:10:02.312Z',
            descriptorName: 'Visa',
            isExpired: true,
            panExpirationMonth: '12',
            panExpirationYear: '2020',
            panLastFour: '8902',
            scheme: 'visa',
            srcCorrelationId: '123456',
            srcDigitalCardId: 'xxxx',
            tokenId: '9w8e8e'
        }
    ];

    sdkLoader.load.mockResolvedValue([visa, mc]);

    // @ts-ignore Mocking readonly property
    visa.schemeName = 'visa';
    visa.init.mockResolvedValue();
    visa.unbindAppInstance.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: true, idTokens: mockedIdToken });
    visa.getSrcProfile.mockResolvedValue(profileFromVisaSrcSystem);

    mc.init.mockResolvedValue();
    mc.unbindAppInstance.mockResolvedValue();
    mc.isRecognized.mockResolvedValue({ recognized: false });
    mc.getSrcProfile.mockRejectedValue(mock<SrciError>());

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics);
    service.subscribeOnStateChange(stateSubscriberFn);
    await service.initialize();

    expect(service.shopperCards).toEqual(expectedShopperCards);
    expect(service.state).toBe(CtpState.Ready);

    await service.logout();

    expect(visa.unbindAppInstance.mock.calls.length).toBe(1);
    expect(mc.unbindAppInstance.mock.calls.length).toBe(1);
    expect(service.state).toBe(CtpState.Login);
    expect(service.shopperCards).toBeNull();
    expect(stateSubscriberFn).toHaveBeenCalledTimes(3);
});

test('should authenticate the shopper with the fastest SDK that finds the shopper in the CtP system', async () => {
    const visa = mock<VisaSdk>();
    const mc = mock<MastercardSdk>();
    const sdkLoader = mock<ISrcSdkLoader>();
    const schemesConfig = mock<SchemesConfiguration>();
    const mockedIdToken = 'xxxx-yyyy';
    const otp = '654321';
    const identity: IdentityLookupParams = {
        shopperEmail: 'shopper@email.com'
    };

    const profileFromVisaSrcSystem: SrcProfile = {
        srcCorrelationId: '123456',
        profiles: [
            {
                maskedCards: []
            }
        ]
    };

    const profileFromMastercardSystem = {
        srcCorrelationId: '1a2b3c',
        profiles: [
            {
                maskedCards: [
                    {
                        srcDigitalCardId: 'yyyy',
                        panLastFour: '4302',
                        dateOfCardCreated: '2015-01-20T06:00:00.312Z',
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
    };

    const expectedShopperCards = [
        {
            artUri: 'https://image.com/mc',
            dateOfCardCreated: '2015-01-20T06:00:00.312Z',
            dateOfCardLastUsed: '2019-12-25T20:20:02.942Z',
            descriptorName: 'Mastercard',
            isExpired: true,
            panExpirationMonth: '12',
            panExpirationYear: '2020',
            panLastFour: '4302',
            scheme: 'mc',
            srcCorrelationId: '1a2b3c',
            srcDigitalCardId: 'yyyy',
            tokenId: '2a2a3b3b'
        }
    ];

    sdkLoader.load.mockResolvedValue([visa, mc]);

    // @ts-ignore Mocking readonly property
    visa.schemeName = 'visa';
    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: false });
    visa.getSrcProfile.mockResolvedValue(profileFromVisaSrcSystem);
    visa.identityLookup.mockImplementation(
        () => new Promise<SrciIdentityLookupResponse>(resolve => setTimeout(() => resolve({ consumerPresent: true }), 700))
    );

    // @ts-ignore Mocking readonly property
    mc.schemeName = 'mc';
    mc.init.mockResolvedValue();
    mc.isRecognized.mockResolvedValue({ recognized: false });
    mc.initiateIdentityValidation.mockResolvedValue({ maskedValidationChannel: '+31*******55' });
    mc.completeIdentityValidation.mockResolvedValue({ idToken: mockedIdToken });
    mc.getSrcProfile.mockResolvedValue(profileFromMastercardSystem);
    mc.identityLookup.mockImplementation(
        () => new Promise<SrciIdentityLookupResponse>(resolve => setTimeout(() => resolve({ consumerPresent: true }), 200))
    );

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', mockAnalytics, identity);
    await service.initialize();

    expect(mc.identityLookup).toHaveBeenCalledWith({ identityValue: identity.shopperEmail, type: 'email' });
    expect(visa.identityLookup).toHaveBeenCalledWith({ identityValue: identity.shopperEmail, type: 'email' });
    expect(service.state).toBe(CtpState.ShopperIdentified);

    await service.startIdentityValidation();

    expect(visa.initiateIdentityValidation).toHaveBeenCalledTimes(0);
    expect(mc.initiateIdentityValidation).toHaveBeenCalledTimes(1);
    expect(service.state).toBe(CtpState.OneTimePassword);
    expect(service.identityValidationData).toEqual({ maskedShopperContact: '+31•••••••55', selectedNetwork: 'Mastercard' });

    // Resend OTP
    await service.startIdentityValidation();

    expect(visa.initiateIdentityValidation).toHaveBeenCalledTimes(0);
    expect(mc.initiateIdentityValidation).toHaveBeenCalledTimes(2);
    expect(service.state).toBe(CtpState.OneTimePassword);
    expect(service.identityValidationData).toEqual({ maskedShopperContact: '+31•••••••55', selectedNetwork: 'Mastercard' });

    await service.finishIdentityValidation(otp);

    expect(visa.completeIdentityValidation).toHaveBeenCalledTimes(0);
    expect(mc.completeIdentityValidation).toHaveBeenCalledTimes(1);

    expect(visa.getSrcProfile).toHaveBeenCalledWith([mockedIdToken]);
    expect(mc.getSrcProfile).toHaveBeenCalledWith([mockedIdToken]);
    expect(service.shopperCards).toEqual(expectedShopperCards);
    expect(service.state).toEqual(CtpState.Ready);
});
