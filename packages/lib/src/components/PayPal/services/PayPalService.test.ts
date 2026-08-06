import { PayPalService, PayPalServiceConfig } from './PayPalService';
import { PayPalSdkLoader } from './PayPalSdkLoader';
import requestPayPalOauthToken from './request-paypal-oauth-token';
import { mock } from 'jest-mock-extended';
import type { PayPalComponents, PayPalEligiblePaymentMethods, PayPalSdkInstance } from '../paypal-js-types';
import type { PayPalV6Namespace } from '@paypal/paypal-js/sdk-v6';

jest.mock('./request-paypal-oauth-token');

const requestPayPalOauthTokenMock = requestPayPalOauthToken as jest.Mock;

const findEligibleMethodsMock = jest.fn();
const createInstanceMock = jest.fn();

const sdkInstance = { findEligibleMethods: findEligibleMethodsMock } as unknown as PayPalSdkInstance;
const eligibleMethods = mock<PayPalEligiblePaymentMethods>();

const createConfig = (overrides: Partial<PayPalServiceConfig> = {}): PayPalServiceConfig => ({
    loadingContext: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
    clientKey: 'test_client_key',
    merchantId: 'test_merchant',
    sdkLoader: mock<PayPalSdkLoader>(),
    countryCode: 'US',
    amount: { value: 1000, currency: 'USD' },
    vault: false,
    components: ['paypal-payments'],
    ...overrides
});

describe('PayPalService', () => {
    beforeEach(() => {
        createInstanceMock.mockResolvedValue(sdkInstance);
        findEligibleMethodsMock.mockResolvedValue(eligibleMethods);
        requestPayPalOauthTokenMock.mockResolvedValue({ clientToken: 'client-token-123' });
        window.paypal = mock<PayPalV6Namespace>({ createInstance: createInstanceMock });
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete window.paypal;
    });

    test('should load the SDK when the service is created', () => {
        const config = createConfig();

        new PayPalService(config);

        expect(config.sdkLoader.load).toHaveBeenCalledTimes(1);
    });

    describe('initialize()', () => {
        test('should wait for the SDK, request the oauth token and create the SDK instance and payment methods', async () => {
            const config = createConfig();
            const service = new PayPalService(config);

            await service.initialize();

            expect(config.sdkLoader.isSdkLoaded).toHaveBeenCalledTimes(1);
            expect(requestPayPalOauthTokenMock).toHaveBeenCalledWith(config.loadingContext, {
                clientKey: config.clientKey,
                merchantId: config.merchantId
            });
            expect(createInstanceMock).toHaveBeenCalledWith({
                clientToken: 'client-token-123',
                components: config.components,
                merchantId: config.merchantId,
                pageType: undefined,
                locale: undefined,
                testBuyerCountry: config.countryCode
            });
            expect(findEligibleMethodsMock).toHaveBeenCalledWith({
                currencyCode: 'USD',
                countryCode: 'US',
                paymentFlow: undefined
            });
            expect(service.getInstance()).toBe(sdkInstance);
            expect(service.getEligiblePaymentMethods()).toBe(eligibleMethods);
        });

        test('should forward the configured components to the SDK instance', async () => {
            const components: PayPalComponents = ['paypal-payments', 'venmo-payments', 'paypal-messages'];
            const service = new PayPalService(createConfig({ components }));

            await service.initialize();

            expect(createInstanceMock).toHaveBeenCalledWith(expect.objectContaining({ components }));
        });

        test('should only forward the "paypal-payments" component when no other component is configured', async () => {
            const service = new PayPalService(createConfig({ components: ['paypal-payments'] }));

            await service.initialize();

            expect(createInstanceMock).toHaveBeenCalledWith(expect.objectContaining({ components: ['paypal-payments'] }));
        });

        test('should forward the pageType and the supported locale to the SDK instance', async () => {
            const service = new PayPalService(createConfig({ pageType: 'product-details', locale: 'en_US' }));

            await service.initialize();

            expect(createInstanceMock).toHaveBeenCalledWith(expect.objectContaining({ pageType: 'product-details', locale: 'en-US' }));
        });

        test('should not forward an unsupported locale to the SDK instance', async () => {
            const service = new PayPalService(createConfig({ locale: 'xx-XX' }));

            await service.initialize();

            expect(createInstanceMock).toHaveBeenCalledWith(expect.objectContaining({ locale: undefined }));
        });

        test('should set the testBuyerCountry in the test environment', async () => {
            const service = new PayPalService(createConfig({ environment: 'test', countryCode: 'NL' }));

            await service.initialize();

            expect(createInstanceMock).toHaveBeenCalledWith(expect.objectContaining({ testBuyerCountry: 'NL' }));
        });

        test('should set the testBuyerCountry when the environment is not specified', async () => {
            const service = new PayPalService(createConfig({ environment: undefined, countryCode: 'NL' }));

            await service.initialize();

            expect(createInstanceMock).toHaveBeenCalledWith(expect.objectContaining({ testBuyerCountry: 'NL' }));
        });

        test('should not set the testBuyerCountry in the live environment', async () => {
            const service = new PayPalService(createConfig({ environment: 'live', countryCode: 'NL' }));

            await service.initialize();

            expect(createInstanceMock).toHaveBeenCalledWith(expect.objectContaining({ testBuyerCountry: undefined }));
        });

        test('should use the "v6" namespace to create the instance when available', async () => {
            const v6CreateInstanceMock = jest.fn().mockResolvedValue(sdkInstance);
            window.paypal = mock<typeof window.paypal>({
                v6: { createInstance: v6CreateInstanceMock },
                createInstance: createInstanceMock
            });

            const service = new PayPalService(createConfig());
            await service.initialize();

            expect(v6CreateInstanceMock).toHaveBeenCalledTimes(1);
            expect(createInstanceMock).not.toHaveBeenCalled();
        });

        test('should reject when the PayPal SDK "createInstance" is not available', async () => {
            window.paypal = mock<typeof window.paypal>({ v6: undefined, createInstance: undefined });

            const service = new PayPalService(createConfig());

            await expect(service.initialize()).rejects.toThrow('PayPal SDK `createInstance` is not available');
            expect(findEligibleMethodsMock).not.toHaveBeenCalled();
        });

        test('should use "VAULT_WITHOUT_PAYMENT" payment flow for a zero-auth transaction', async () => {
            const config = createConfig({ amount: { value: 0, currency: 'USD' } });
            const service = new PayPalService(config);

            await service.initialize();

            expect(findEligibleMethodsMock).toHaveBeenCalledWith(expect.objectContaining({ paymentFlow: 'VAULT_WITHOUT_PAYMENT' }));
        });

        test('should use "VAULT_WITH_PAYMENT" payment flow when vault is enabled', async () => {
            const config = createConfig({ vault: true });
            const service = new PayPalService(config);

            await service.initialize();

            expect(findEligibleMethodsMock).toHaveBeenCalledWith(expect.objectContaining({ paymentFlow: 'VAULT_WITH_PAYMENT' }));
        });

        test('should return the same promise and only initialize once when called multiple times', async () => {
            const config = createConfig();
            const service = new PayPalService(config);

            const firstCall = service.initialize();
            const secondCall = service.initialize();
            const thirdCall = service.initialize();

            expect(firstCall).toStrictEqual(secondCall);
            expect(firstCall).toStrictEqual(thirdCall);

            await Promise.all([firstCall, secondCall, thirdCall]);

            expect(config.sdkLoader.isSdkLoaded).toHaveBeenCalledTimes(1);
            expect(requestPayPalOauthTokenMock).toHaveBeenCalledTimes(1);
            expect(createInstanceMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('isSdkLoaded()', () => {
        test('should reject when initialize() has not been called', async () => {
            const service = new PayPalService(createConfig());

            await expect(service.isSdkLoaded()).rejects.toThrow('PayPal SDK not loaded');
        });

        test('should resolve once initialize() has completed', async () => {
            const service = new PayPalService(createConfig());
            await service.initialize();

            await expect(service.isSdkLoaded()).resolves.toBeUndefined();
        });
    });

    describe('getInstance() / getEligiblePaymentMethods()', () => {
        test('should return undefined before initialization', () => {
            const service = new PayPalService(createConfig());

            expect(service.getInstance()).toBeUndefined();
            expect(service.getEligiblePaymentMethods()).toBeUndefined();
        });
    });
});
