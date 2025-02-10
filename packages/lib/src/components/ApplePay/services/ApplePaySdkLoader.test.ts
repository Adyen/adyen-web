import { APPLE_PAY_SDK_URL, ApplePaySdkLoader } from './ApplePaySdkLoader';
import Script from '../../../utils/Script';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { mock } from 'jest-mock-extended';

jest.mock('../../../utils/Script');

const mockLoad = jest.fn().mockImplementation(() => {
    const mockApplePaySession = mock<ApplePaySession>();
    Object.defineProperty(window, 'ApplePaySession', mockApplePaySession);
    return Promise.resolve(true);
});

describe('ApplePaySdkLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new ApplePaySdkLoader();
        // @ts-ignore 'mockClear' is provided by jest.mock
        Script.mockClear();
        mockLoad.mockClear();
    });

    test('should load ApplePay SDK successfully', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: mockLoad }));

        await expect(loader.load()).resolves.toBe(global.window.ApplePaySession);
        expect(Script).toHaveBeenCalledWith(APPLE_PAY_SDK_URL, 'body', { crossOrigin: 'anonymous' });
        expect(mockLoad).toHaveBeenCalledTimes(1);
    });

    test('should throw AdyenCheckoutError when script loading fails', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: jest.fn().mockRejectedValue(new Error('Network error')) }));

        await expect(loader.load()).rejects.toThrow(AdyenCheckoutError);
        await expect(loader.load()).rejects.toThrow('ApplePaySDK failed to load');
    });

    test('should resolve isSdkLoaded() if ApplePaySDK is successfully loaded', async () => {
        // @ts-ignore 'Script' is mocked
        Script.mockImplementation(() => ({ load: mockLoad }));

        await expect(loader.load()).resolves.toBe(global.window.ApplePaySession);
        await expect(loader.isSdkLoaded()).resolves.toBeTruthy();
    });

    test('should reject isSdkLoaded() if ApplePaySDK is not loaded', async () => {
        await expect(loader.isSdkLoaded()).rejects.toBeUndefined();
    });
});
