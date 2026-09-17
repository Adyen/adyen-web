import { PayPalService, PayPalServiceConfig, PayPalServiceRefreshConfig } from './PayPalService';
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

const createRefreshConfig = (overrides: Partial<PayPalServiceRefreshConfig> = {}): PayPalServiceRefreshConfig => {
    const { sdkLoader: _sdkLoader, ...config } = createConfig();
    return { ...config, ...overrides };
};

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

    describe('refresh()', () => {
        test('should create a new SDK instance and re-evaluate the eligible payment methods with the new configuration', async () => {
            const service = new PayPalService(createConfig());
            await service.initialize();

            await service.refresh(
                createRefreshConfig({
                    amount: { value: 5000, currency: 'GBP' },
                    countryCode: 'GB',
                    vault: true,
                    locale: 'en_GB',
                    components: ['paypal-payments', 'venmo-payments']
                })
            );

            expect(createInstanceMock).toHaveBeenCalledTimes(2);
            expect(createInstanceMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    components: ['paypal-payments', 'venmo-payments'],
                    locale: 'en-GB',
                    testBuyerCountry: 'GB'
                })
            );
            expect(findEligibleMethodsMock).toHaveBeenLastCalledWith({
                currencyCode: 'GBP',
                countryCode: 'GB',
                paymentFlow: 'VAULT_WITH_PAYMENT'
            });
        });

        test('should request a new client token', async () => {
            const service = new PayPalService(createConfig());
            await service.initialize();

            await service.refresh(createRefreshConfig({ merchantId: 'other-merchant' }));

            expect(requestPayPalOauthTokenMock).toHaveBeenCalledTimes(2);
            expect(requestPayPalOauthTokenMock).toHaveBeenLastCalledWith(expect.any(String), {
                clientKey: 'test_client_key',
                merchantId: 'other-merchant'
            });
        });

        test('should serve the previous SDK instance until the refresh completes', async () => {
            const service = new PayPalService(createConfig());
            await service.initialize();

            const newEligibleMethods = mock<PayPalEligiblePaymentMethods>();
            const newSdkInstance = { findEligibleMethods: jest.fn().mockResolvedValue(newEligibleMethods) } as unknown as PayPalSdkInstance;

            let resolveCreateInstance: (instance: PayPalSdkInstance) => void;
            createInstanceMock.mockReturnValueOnce(new Promise(resolve => (resolveCreateInstance = resolve)));

            const refreshPromise = service.refresh(createRefreshConfig({ countryCode: 'NL' }));

            let isSdkLoadedResolved = false;
            void service.isSdkLoaded().then(() => (isSdkLoadedResolved = true));
            await new Promise(process.nextTick);

            expect(isSdkLoadedResolved).toBe(false);
            expect(service.getInstance()).toBe(sdkInstance);

            resolveCreateInstance(newSdkInstance);
            await refreshPromise;
            await new Promise(process.nextTick);

            expect(isSdkLoadedResolved).toBe(true);
            expect(service.getInstance()).toBe(newSdkInstance);
            expect(service.getEligiblePaymentMethods()).toBe(newEligibleMethods);
        });

        test('should create the SDK instance when initialize() has not been called', async () => {
            const service = new PayPalService(createConfig());

            await service.refresh(createRefreshConfig());

            expect(createInstanceMock).toHaveBeenCalledTimes(1);
            expect(service.getInstance()).toBe(sdkInstance);
        });

        test('should reject and allow a later refresh to recover when it fails', async () => {
            const service = new PayPalService(createConfig());
            await service.initialize();

            requestPayPalOauthTokenMock.mockRejectedValueOnce(new Error('Token request failed'));

            await expect(service.refresh(createRefreshConfig())).rejects.toThrow('Token request failed');
            await expect(service.isSdkLoaded()).rejects.toThrow('PayPal SDK not loaded');

            await expect(service.refresh(createRefreshConfig())).resolves.toBeUndefined();
            await expect(service.isSdkLoaded()).resolves.toBeUndefined();
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
