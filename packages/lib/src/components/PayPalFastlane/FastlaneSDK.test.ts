import { mockDeep, mock, mockReset } from 'jest-mock-extended';
import initializeFastlane from './initializeFastlane';
import { httpPost } from '../../core/Services/http';
import Script from '../../utils/Script';
import FastlaneSDK from './FastlaneSDK';
import type { FastlaneWindowInstance, FastlaneProfile, FastlaneShipping } from './types';

const fastlaneMock = mockDeep<FastlaneWindowInstance>();
let fastlaneConstructorMock = null;

const mockScriptLoaded = jest.fn().mockImplementation(() => {
    window.paypal = {};
    window.paypal.Fastlane = fastlaneConstructorMock;
    return Promise.resolve();
});

jest.mock('../../core/Analytics', () => {
    return jest.fn().mockImplementation(() => {
        return { setUp: jest.fn(), sendAnalytics: jest.fn(), flush: jest.fn() };
    });
});

jest.mock('../../core/Services/http');
jest.mock('../../utils/Script', () => {
    return jest.fn().mockImplementation(() => {
        return { load: mockScriptLoaded };
    });
});

const httpPostMock = (httpPost as jest.Mock).mockResolvedValue({
    id: 'RANDOM-ID',
    clientId: 'CLIENT-ID',
    merchantId: 'XXXYYYZZZ',
    value: 'TOKEN-VALUE',
    expiresAt: '2024-11-01T13:34:01.804+00:00'
});

describe('FastlaneSDK', () => {
    beforeEach(() => {
        mockReset(fastlaneMock);

        fastlaneConstructorMock = jest.fn().mockResolvedValue(fastlaneMock);
        fastlaneMock.identity.getSession.mockResolvedValue({
            sessionId: 'fastlane-session-id'
        });
    });

    test('should force consent details to be returned if "forceConsentDetails" is used', async () => {
        await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test',
            forceConsentDetails: true
        });

        expect(fastlaneConstructorMock).toHaveBeenCalledTimes(1);
        expect(fastlaneConstructorMock).toHaveBeenCalledWith({
            intendedExperience: 'externalProcessorCustomConsent',
            metadata: {
                geoLocOverride: 'US'
            }
        });
    });

    test('should initialize the Fastlane SDK', async () => {
        await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        expect(fastlaneConstructorMock).toHaveBeenCalledTimes(1);
        expect(fastlaneConstructorMock).toHaveBeenCalledWith({
            intendedExperience: 'externalProcessorCustomConsent'
        });
        expect(fastlaneMock.setLocale).toHaveBeenCalledWith('en_us');
        expect(fastlaneMock.identity.getSession).toHaveBeenCalledTimes(1);
        expect(httpPostMock).toHaveBeenCalledWith({
            loadingContext: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
            path: 'utility/v1/payPalFastlane/tokens?clientKey=test_xxx',
            errorLevel: 'fatal'
        });
        expect(Script).toHaveBeenCalledWith({
            src: 'https://www.paypal.com/sdk/js?client-id=CLIENT-ID&components=buttons%2Cfastlane',
            component: 'fastlane',
            dataAttributes: { sdkClientToken: 'TOKEN-VALUE' },
            analytics: expect.anything()
        });
    });

    test('should return not_found if email is not recognized', async () => {
        fastlaneMock.identity.lookupCustomerByEmail.mockResolvedValue({
            customerContextId: null
        });

        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        const authResult = await fastlane.authenticate('test@adyen.com');

        expect(authResult.authenticationState).toBe('not_found');
        expect(authResult.profileData).toBeUndefined();
    });

    test('should authenticate the user with email', async () => {
        const customerContextId = 'customer-context-id';
        const mockedFastlaneProfile = mock<FastlaneProfile>();

        fastlaneMock.identity.lookupCustomerByEmail.mockResolvedValue({
            customerContextId
        });

        fastlaneMock.identity.triggerAuthenticationFlow.mockResolvedValue({
            authenticationState: 'succeeded',
            profileData: mockedFastlaneProfile
        });

        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        const authResult = await fastlane.authenticate('test@adyen.com');

        expect(fastlaneMock.identity.lookupCustomerByEmail).toHaveBeenCalledWith('test@adyen.com');
        expect(fastlaneMock.identity.triggerAuthenticationFlow).toHaveBeenCalledWith(customerContextId);
        expect(authResult.authenticationState).toBe('succeeded');
        expect(authResult.profileData).toBeDefined();
    });

    test('should call Fastlane shipping address selector method', async () => {
        const customerContextId = 'customer-context-id';
        const mockedFastlaneProfile = mock<FastlaneProfile>();
        const mockedFastlaneShipping = mock<FastlaneShipping>();

        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        fastlaneMock.profile.showShippingAddressSelector.mockResolvedValue({
            selectionChanged: false,
            selectedAddress: mockedFastlaneShipping
        });

        fastlaneMock.identity.lookupCustomerByEmail.mockResolvedValue({
            customerContextId
        });

        fastlaneMock.identity.triggerAuthenticationFlow.mockResolvedValue({
            authenticationState: 'succeeded',
            profileData: mockedFastlaneProfile
        });

        await fastlane.authenticate('test@adyen.com');
        const addressSelectorResult = await fastlane.showShippingAddressSelector();

        expect(fastlaneMock.profile.showShippingAddressSelector).toHaveBeenCalledTimes(1);
        expect(addressSelectorResult.selectionChanged).toBeFalsy();
    });

    test('should mount Fastlane watermark', async () => {
        const componentMock = {
            render: jest.fn()
        };
        fastlaneMock.FastlaneWatermarkComponent.mockResolvedValue(componentMock);

        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        await fastlane.mountWatermark('.my-div');

        expect(fastlaneMock.FastlaneWatermarkComponent).toHaveBeenCalledTimes(1);
        expect(componentMock.render).toHaveBeenCalledTimes(1);
        expect(componentMock.render).toHaveBeenCalledWith('.my-div');
    });

    test('should return fastlane component configuration if shopper has profile', async () => {
        const customerContextId = 'customer-context-id';
        fastlaneMock.identity.lookupCustomerByEmail.mockResolvedValue({
            customerContextId
        });
        fastlaneMock.identity.triggerAuthenticationFlow.mockResolvedValue({
            authenticationState: 'succeeded',
            profileData: mock<FastlaneProfile>({
                card: {
                    id: 'xxxx',
                    paymentSource: {
                        card: {
                            brand: 'visa',
                            lastDigits: '1111'
                        }
                    }
                }
            })
        });
        fastlaneMock.identity.getSession.mockResolvedValue({
            sessionId: 'fastlane-session-id'
        });

        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });
        const authResult = await fastlane.authenticate('test@adyen.com');
        const config = await fastlane.getComponentConfiguration(authResult);

        expect(config).toStrictEqual({
            paymentType: 'fastlane',
            configuration: {
                brand: 'visa',
                email: 'test@adyen.com',
                lastFour: '1111',
                fastlaneSessionId: 'fastlane-session-id',
                tokenId: 'xxxx'
            }
        });
    });

    test('should return Card configuration if fastlane profile does not have a card assigned to it', async () => {
        const customerContextId = 'customer-context-id';
        fastlaneMock.identity.lookupCustomerByEmail.mockResolvedValue({
            customerContextId
        });
        fastlaneMock.identity.triggerAuthenticationFlow.mockResolvedValue({
            authenticationState: 'succeeded',
            profileData: mock<FastlaneProfile>({
                card: undefined
            })
        });
        fastlaneMock.identity.getSession.mockResolvedValue({
            sessionId: 'fastlane-session-id'
        });
        fastlaneMock.ConsentComponent.mockResolvedValue({
            getRenderState: jest.fn().mockResolvedValue({
                showConsent: true,
                defaultToggleState: true,
                termsAndConditionsLink: 'https://fastlane.com/terms',
                termsAndConditionsVersion: 'v1',
                privacyPolicyLink: 'https://fastlane.com/privacy'
            })
        });

        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });
        const authResult = await fastlane.authenticate('test@adyen.com');

        const config = await fastlane.getComponentConfiguration(authResult);

        expect(config).toStrictEqual({
            paymentType: 'card',
            configuration: {
                fastlaneConfiguration: {
                    defaultToggleState: true,
                    showConsent: true,
                    fastlaneSessionId: 'fastlane-session-id',
                    privacyPolicyLink: 'https://fastlane.com/privacy',
                    termsAndConditionsLink: 'https://fastlane.com/terms',
                    termsAndConditionsVersion: 'v1'
                }
            }
        });
    });

    test('should return card component configuration if shopper does not have profile', async () => {
        const customerContextId = 'customer-context-id';
        fastlaneMock.identity.lookupCustomerByEmail.mockResolvedValue({
            customerContextId
        });
        fastlaneMock.identity.triggerAuthenticationFlow.mockResolvedValue({
            authenticationState: 'not_found',
            profileData: undefined
        });
        fastlaneMock.identity.getSession.mockResolvedValue({
            sessionId: 'fastlane-session-id'
        });
        fastlaneMock.ConsentComponent.mockResolvedValue({
            getRenderState: jest.fn().mockResolvedValue({
                showConsent: true,
                defaultToggleState: true,
                termsAndConditionsLink: 'https://fastlane.com/terms',
                termsAndConditionsVersion: 'v1',
                privacyPolicyLink: 'https://fastlane.com/privacy'
            })
        });

        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        const authResult = await fastlane.authenticate('test@adyen.com');
        const config = await fastlane.getComponentConfiguration(authResult);

        expect(fastlaneMock.ConsentComponent).toHaveBeenCalledTimes(1);
        expect(config).toStrictEqual({
            paymentType: 'card',
            configuration: {
                fastlaneConfiguration: {
                    defaultToggleState: true,
                    showConsent: true,
                    fastlaneSessionId: 'fastlane-session-id',
                    privacyPolicyLink: 'https://fastlane.com/privacy',
                    termsAndConditionsLink: 'https://fastlane.com/terms',
                    termsAndConditionsVersion: 'v1'
                }
            }
        });
    });

    test('should return card component configuration with undefined consent values if showConsent is false', async () => {
        const customerContextId = 'customer-context-id';
        fastlaneMock.identity.lookupCustomerByEmail.mockResolvedValue({
            customerContextId
        });
        fastlaneMock.identity.triggerAuthenticationFlow.mockResolvedValue({
            authenticationState: 'not_found',
            profileData: undefined
        });
        fastlaneMock.identity.getSession.mockResolvedValue({
            sessionId: 'fastlane-session-id'
        });
        fastlaneMock.ConsentComponent.mockResolvedValue({
            getRenderState: jest.fn().mockResolvedValue({
                showConsent: false,
                defaultToggleState: undefined,
                termsAndConditionsLink: undefined,
                termsAndConditionsVersion: undefined,
                privacyPolicyLink: undefined
            })
        });

        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        const authResult = await fastlane.authenticate('test@adyen.com');
        const config = await fastlane.getComponentConfiguration(authResult);

        expect(fastlaneMock.ConsentComponent).toHaveBeenCalledTimes(1);
        expect(config).toStrictEqual({
            paymentType: 'card',
            configuration: {
                fastlaneConfiguration: {
                    showConsent: false,
                    fastlaneSessionId: 'fastlane-session-id',
                    defaultToggleState: undefined,
                    privacyPolicyLink: undefined,
                    termsAndConditionsLink: undefined,
                    termsAndConditionsVersion: undefined
                }
            }
        });
    });

    test('should throw an error if it fails to get the consent details for the unrecognized shopper', async () => {
        const customerContextId = 'customer-context-id';
        fastlaneMock.identity.lookupCustomerByEmail.mockResolvedValue({
            customerContextId
        });
        fastlaneMock.identity.triggerAuthenticationFlow.mockResolvedValue({
            authenticationState: 'not_found',
            profileData: undefined
        });
        fastlaneMock.identity.getSession.mockResolvedValue({
            sessionId: 'fastlane-session-id'
        });
        fastlaneMock.ConsentComponent.mockResolvedValue({
            getRenderState: jest.fn().mockRejectedValue({})
        });

        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        const authResult = await fastlane.authenticate('test@adyen.com');

        await expect(fastlane.getComponentConfiguration(authResult)).rejects.toThrow('fetchConsentDetails(): failed to fetch consent details');
    });

    test('should thrown an error if there is no auth result to create the component configuration', async () => {
        const fastlane = await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        // @ts-ignore It is expected to omit the parameter here
        await expect(fastlane.getComponentConfiguration()).rejects.toThrowError();
    });

    test('should throw error if environment and clientKey are not passed when initializing it', async () => {
        // @ts-ignore Testing not passing the parameters
        await expect(initializeFastlane()).rejects.toThrowError("FastlaneSDK: 'environment' property is required");

        // @ts-ignore Testing not passing the parameters
        await expect(initializeFastlane({ environment: 'test' })).rejects.toThrowError("FastlaneSDK: 'clientKey' property is required");
    });

    test('should warn if "forceConsentDetails" is set in a "live" environment', async () => {
        const mock = jest.spyOn(console, 'warn').mockImplementation();
        await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'live',
            forceConsentDetails: true
        });

        expect(mock).toHaveBeenLastCalledWith("Fastlane SDK: 'forceConsentDetails' should not be used on 'live' environment");
    });

    test('should warn if fetching the Fastlane session ID fails', async () => {
        const mock = jest.spyOn(console, 'warn').mockImplementation();
        fastlaneMock.identity.getSession.mockRejectedValue({});

        await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        expect(mock).toHaveBeenLastCalledWith('Fastlane SDK: Failed to fetch session ID', {});
    });

    test('should throw error if Fastlane does not get created', async () => {
        fastlaneConstructorMock = jest.fn().mockRejectedValue({});
        await expect(initializeFastlane({ clientKey: 'test_xxx', environment: 'test' })).rejects.toThrowError(
            'Fastlane SDK: Failed to initialize fastlane using the window.paypal.Fastlane constructor'
        );
    });

    test('should throw error if authentication is triggered without Fastlane being available', async () => {
        const fastlaneSdk = new FastlaneSDK({ environment: 'test', clientKey: 'test' });
        await expect(fastlaneSdk.authenticate('test@adyen.com')).rejects.toThrowError('authenticate(): Fastlane SDK is not initialized');
    });
});
