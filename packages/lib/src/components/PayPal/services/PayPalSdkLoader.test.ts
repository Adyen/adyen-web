import { PayPalSdkLoader } from './PayPalSdkLoader';
import Script from '../../../utils/Script';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { mock } from 'jest-mock-extended';
import type { IAnalytics } from '../../../core/Analytics/Analytics';

jest.mock('../../../utils/Script');

const PAYPAL_SDK_URL = 'https://www.sandbox.paypal.com/web-sdk/v6/core';

const mockPayPal = mock<typeof window.paypal>();
const mockLoad = jest.fn().mockImplementation(() => {
    window.paypal = mockPayPal;
    return Promise.resolve(true);
});

const mockAnalytics = mock<IAnalytics>();

describe('PayPalSdkLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new PayPalSdkLoader({ analytics: mockAnalytics });
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
            src: PAYPAL_SDK_URL,
            analytics: mockAnalytics,
            attributes: { crossOrigin: 'anonymous' }
        });

        expect(mockLoad).toHaveBeenCalledTimes(1);
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
