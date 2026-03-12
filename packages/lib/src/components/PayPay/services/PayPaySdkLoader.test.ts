import PayPaySdkLoader, { PAYPAY_SDK_URL } from './PayPaySdkLoader';
import Script from '../../../utils/Script';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { mock } from 'jest-mock-extended';
import type { IAnalytics } from '../../../core/Analytics/Analytics';

jest.mock('../../../utils/Script');

const mockLoad = jest.fn().mockImplementation(() => {
    Object.defineProperty(window, 'pp', {
        value: { init: jest.fn() },
        writable: true,
        configurable: true
    });
    return Promise.resolve();
});

const mockAnalytics = mock<IAnalytics>();

describe('PayPaySdkLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new PayPaySdkLoader({ analytics: mockAnalytics });
        // @ts-ignore 'mockClear' is provided by jest.mock
        Script.mockClear();
        mockLoad.mockClear();
    });

    test('should load PayPay SDK successfully', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: mockLoad }));

        await expect(loader.load()).resolves.toBeUndefined();
        expect(Script).toHaveBeenCalledWith({
            component: 'paypay',
            src: PAYPAY_SDK_URL,
            analytics: mockAnalytics,
            attributes: { crossOrigin: 'anonymous' }
        });

        expect(mockLoad).toHaveBeenCalledTimes(1);
    });

    test('should throw AdyenCheckoutError when script loading fails', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: jest.fn().mockRejectedValue(new Error('Network error')) }));

        await expect(loader.load()).rejects.toThrow(AdyenCheckoutError);
        await expect(loader.load()).rejects.toThrow('PayPay SDK failed to load');
    });

    test('should resolve isSdkLoaded() if PayPay SDK is successfully loaded', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: mockLoad }));

        await loader.load();
        await expect(loader.isSdkLoaded()).resolves.toBeUndefined();
    });

    test('should reject isSdkLoaded() if PayPay SDK is not loaded', async () => {
        await expect(loader.isSdkLoaded()).rejects.toBeUndefined();
    });
});
