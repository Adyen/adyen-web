import { mockDeep, mock, mockReset } from 'jest-mock-extended';
import initializeFastlane from './initializeFastlane';
import { httpPost } from '../../core/Services/http';
import Script from '../../utils/Script';
import type { Fastlane, FastlaneProfile, FastlaneShipping } from './types';

const fastlaneMock = mockDeep<Fastlane>();
const fastlaneConstructorMock = jest.fn().mockResolvedValue(fastlaneMock);

const mockScriptLoaded = jest.fn().mockImplementation(() => {
    window.paypal = {};
    window.paypal.Fastlane = fastlaneConstructorMock;
    return Promise.resolve();
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
    });

    test('should initialize the Fastlane SDK', async () => {
        await initializeFastlane({
            clientKey: 'test_xxx',
            environment: 'test'
        });

        expect(fastlaneConstructorMock).toHaveBeenCalledTimes(1);
        expect(fastlaneConstructorMock).toHaveBeenCalledWith({});
        expect(fastlaneMock.setLocale).toHaveBeenCalledWith('en_us');
        expect(httpPostMock).toHaveBeenCalledWith({
            loadingContext: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
            path: 'utility/v1/payPalFastlane/tokens?clientKey=test_xxx',
            errorLevel: 'fatal'
        });
        expect(Script).toHaveBeenCalledWith(
            'https://www.paypal.com/sdk/js?client-id=CLIENT-ID&components=buttons,fastlane',
            'body',
            {},
            { sdkClientToken: 'TOKEN-VALUE' }
        );
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
});
