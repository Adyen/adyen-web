import ClickToPayService, { CtpState } from './ClickToPayService';
import { mock } from 'jest-mock-extended';
import { ISrcSdkLoader } from './sdks/SrcSdkLoader';
import VisaSdk from './sdks/VisaSdk';
import MastercardSdk from './sdks/MastercardSdk';
import { IdentityLookupParams, SchemesConfiguration, SrcProfileWithScheme } from './types';
import { SrciIdentityLookupResponse, SrcProfile } from './sdks/types';
import SrciError from './sdks/SrciError';

test('should pass the correct configuration to the respective scheme SDKs', async () => {
    const visa = mock<VisaSdk>();
    const mc = mock<MastercardSdk>();
    const sdkLoader = mock<ISrcSdkLoader>();

    // @ts-ignore
    visa.schemeName = 'visa';
    visa.isRecognized.mockResolvedValue({ recognized: false });

    // @ts-ignore
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

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test');
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

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test');
    await service.initialize();

    expect(service.state).toBe(CtpState.NotAvailable);
});

test('should set state to not available if there is no cookie AND provided shopper identity is not enrolled in the CtP system', async () => {
    const visa = mock<VisaSdk>();
    const sdkLoader = mock<ISrcSdkLoader>();
    const schemesConfig = mock<SchemesConfiguration>();
    const identity: IdentityLookupParams = {
        value: 'shopper@email.com',
        type: 'email'
    };

    sdkLoader.load.mockResolvedValue([visa]);

    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: false });
    visa.identityLookup.mockResolvedValue({ consumerPresent: false });

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', identity);
    await service.initialize();

    expect(visa.identityLookup).toHaveBeenCalledWith(identity);
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

    // @ts-ignore
    visa.schemeName = 'visa';
    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: true, idTokens: mockedIdToken });
    visa.getSrcProfile.mockResolvedValue(profileFromVisaSrcSystem);

    mc.init.mockResolvedValue();
    mc.isRecognized.mockResolvedValue({ recognized: false });
    mc.getSrcProfile.mockRejectedValue(mock<SrciError>());

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test');
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

    // @ts-ignore
    visa.schemeName = 'visa';
    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: true, idTokens: mockedIdToken });
    visa.getSrcProfile.mockResolvedValue(profileFromVisaSrcSystem);

    // @ts-ignore
    mc.schemeName = 'mc';
    mc.init.mockResolvedValue();
    mc.isRecognized.mockResolvedValue({ recognized: false });
    mc.getSrcProfile.mockResolvedValue(profileFromMastercardSystem);

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test');
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

    // @ts-ignore
    visa.schemeName = 'visa';
    visa.init.mockResolvedValue();
    visa.unbindAppInstance.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: true, idTokens: mockedIdToken });
    visa.getSrcProfile.mockResolvedValue(profileFromVisaSrcSystem);

    mc.init.mockResolvedValue();
    mc.unbindAppInstance.mockResolvedValue();
    mc.isRecognized.mockResolvedValue({ recognized: false });
    mc.getSrcProfile.mockRejectedValue(mock<SrciError>());

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test');
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
        value: 'shopper@email.com',
        type: 'email'
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

    // @ts-ignore
    visa.schemeName = 'visa';
    visa.init.mockResolvedValue();
    visa.isRecognized.mockResolvedValue({ recognized: false });
    visa.getSrcProfile.mockResolvedValue(profileFromVisaSrcSystem);
    visa.identityLookup.mockImplementation(
        () => new Promise<SrciIdentityLookupResponse>(resolve => setTimeout(() => resolve({ consumerPresent: true }), 700))
    );

    // @ts-ignore
    mc.schemeName = 'mc';
    mc.init.mockResolvedValue();
    mc.isRecognized.mockResolvedValue({ recognized: false });
    mc.initiateIdentityValidation.mockResolvedValue({ maskedValidationChannel: '+31*******55' });
    mc.completeIdentityValidation.mockResolvedValue({ idToken: mockedIdToken });
    mc.getSrcProfile.mockResolvedValue(profileFromMastercardSystem);
    mc.identityLookup.mockImplementation(
        () => new Promise<SrciIdentityLookupResponse>(resolve => setTimeout(() => resolve({ consumerPresent: true }), 200))
    );

    const service = new ClickToPayService(schemesConfig, sdkLoader, 'test', identity);
    await service.initialize();

    expect(mc.identityLookup).toHaveBeenCalledWith(identity);
    expect(visa.identityLookup).toHaveBeenCalledWith(identity);
    expect(service.state).toBe(CtpState.ShopperIdentified);

    await service.startIdentityValidation();

    expect(visa.initiateIdentityValidation).toHaveBeenCalledTimes(0);
    expect(mc.initiateIdentityValidation).toHaveBeenCalledTimes(1);
    expect(service.state).toBe(CtpState.OneTimePassword);
    expect(service.shopperValidationContact).toBe('+31•••••••55');

    // Resend OTP
    await service.startIdentityValidation();

    expect(visa.initiateIdentityValidation).toHaveBeenCalledTimes(0);
    expect(mc.initiateIdentityValidation).toHaveBeenCalledTimes(2);
    expect(service.state).toBe(CtpState.OneTimePassword);
    expect(service.shopperValidationContact).toBe('+31•••••••55');

    await service.finishIdentityValidation(otp);

    expect(visa.completeIdentityValidation).toHaveBeenCalledTimes(0);
    expect(mc.completeIdentityValidation).toHaveBeenCalledTimes(1);

    expect(visa.getSrcProfile).toHaveBeenCalledWith([mockedIdToken]);
    expect(mc.getSrcProfile).toHaveBeenCalledWith([mockedIdToken]);
    expect(service.shopperCards).toEqual(expectedShopperCards);
    expect(service.state).toEqual(CtpState.Ready);
});
