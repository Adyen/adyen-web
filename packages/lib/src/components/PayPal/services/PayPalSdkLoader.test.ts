import { PayPalSdkLoader } from './PayPalSdkLoader';
import Script from '../../../utils/Script';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { PAYPAL_SDK_URL_PRODUCTION, PAYPAL_SDK_URL_SANDBOX } from '../config';
import { mock } from 'jest-mock-extended';
import type { IAnalytics } from '../../../core/Analytics/Analytics';

jest.mock('../../../utils/Script');

const mockPayPal = mock<typeof window.paypal>();
const mockLoad = jest.fn().mockImplementation(() => {
    window.paypal = mockPayPal;
    return Promise.resolve(true);
});

const mockAnalytics = mock<IAnalytics>();

describe('PayPalSdkLoader', () => {
    let loader: PayPalSdkLoader;

    beforeEach(() => {
        loader = new PayPalSdkLoader({ analytics: mockAnalytics, environment: 'test' });
        // @ts-ignore 'mockClear' is provided by jest.mock
        Script.mockClear();
        mockLoad.mockClear();
    });

    afterEach(() => {
        delete window.paypal;
    });

    test('should load PayPal SDK successfully', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: mockLoad }));

        await expect(loader.load()).resolves.toBe(window.paypal);
        expect(Script).toHaveBeenCalledWith({
            component: 'paypal',
            src: PAYPAL_SDK_URL_SANDBOX,
            analytics: mockAnalytics,
            attributes: { crossOrigin: 'anonymous' }
        });

        expect(mockLoad).toHaveBeenCalledTimes(1);
    });

    test('should load the production SDK URL when environment is not test', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: mockLoad }));

        const liveLoader = new PayPalSdkLoader({ analytics: mockAnalytics, environment: 'live' });

        await expect(liveLoader.load()).resolves.toBe(window.paypal);
        expect(Script).toHaveBeenCalledWith({
            component: 'paypal',
            src: PAYPAL_SDK_URL_PRODUCTION,
            analytics: mockAnalytics,
            attributes: { crossOrigin: 'anonymous' }
        });
    });

    test('should set the nonce attribute on the script element when a nonce is provided', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: mockLoad }));

        const nonce = 'test-nonce-123';
        const loaderWithNonce = new PayPalSdkLoader({ analytics: mockAnalytics, environment: 'test', nonce });

        await expect(loaderWithNonce.load()).resolves.toBe(window.paypal);
        expect(Script).toHaveBeenCalledWith({
            component: 'paypal',
            src: PAYPAL_SDK_URL_SANDBOX,
            analytics: mockAnalytics,
            attributes: { crossOrigin: 'anonymous', nonce }
        });
    });

    test('should not set the nonce attribute when no nonce is provided', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: mockLoad }));

        await expect(loader.load()).resolves.toBe(window.paypal);
        expect(Script).toHaveBeenCalledWith(
            expect.objectContaining({
                attributes: { crossOrigin: 'anonymous' }
            })
        );
    });

    test('should throw AdyenCheckoutError when script loading fails', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: jest.fn().mockRejectedValue(new Error('Network error')) }));

        await expect(loader.load()).rejects.toThrow(AdyenCheckoutError);
        await expect(loader.load()).rejects.toThrow('PayPal SDK failed to load');
    });

    test('should resolve isSdkLoaded() if PayPalSDK is successfully loaded', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: mockLoad }));

        await expect(loader.load()).resolves.toBe(window.paypal);
        await expect(loader.isSdkLoaded()).resolves.toBeTruthy();
    });

    test('should reject isSdkLoaded() if PayPalSDK is not loaded', async () => {
        await expect(loader.isSdkLoaded()).rejects.toThrow('PayPal SDK not loaded');
    });
});
