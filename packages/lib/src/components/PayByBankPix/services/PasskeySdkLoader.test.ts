import { PasskeySdkLoader } from './PasskeySdkLoader';
import { getUrlFromMap } from '../../../core/Environment/Environment';
import Script from '../../../utils/Script';
import { mock } from 'jest-mock-extended';
import { AnalyticsModule } from '../../../types/global-types';

jest.mock('../../../core/Environment/Environment', () => ({
    getUrlFromMap: jest.fn()
}));

jest.mock('../../../utils/Script', () => {
    return jest.fn().mockImplementation(() => ({
        load: jest.fn().mockResolvedValue(undefined)
    }));
});

describe('PasskeySdkLoader', () => {
    const mockEnvironment = 'test';
    const mockCdnUrl = 'https://cdn.example.com/';
    const mockAdyenPasskey = { default: { someMethod: jest.fn() } };
    const mockAnalytics = mock<AnalyticsModule>();

    let loader: PasskeySdkLoader;

    beforeEach(() => {
        loader = new PasskeySdkLoader({ environment: mockEnvironment, analytics: mockAnalytics });
        (getUrlFromMap as jest.Mock).mockReturnValue(mockCdnUrl);
        (window as any).AdyenPasskey = mockAdyenPasskey;
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete (window as any).AdyenPasskey;
    });

    it('should load script and set AdyenPasskey', async () => {
        const result = await loader.load();

        expect(getUrlFromMap).toHaveBeenCalledWith(mockEnvironment, expect.anything());
        expect(Script).toHaveBeenCalledWith({
            component: 'paybybank_pix',
            src: `${mockCdnUrl}js/adyenpasskey/1.1.0/adyen-passkey.js`,
            analytics: mockAnalytics
        });

        expect(result).toBe(mockAdyenPasskey.default);
    });

    it('should return early if AdyenPasskey is already loaded', async () => {
        await loader.load(); // First time
        const result = await loader.load(); // Second time

        expect(Script).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockAdyenPasskey.default);
    });

    it('should throw AdyenCheckoutError if script fails to load', async () => {
        (Script as unknown as jest.Mock).mockImplementationOnce(() => ({
            load: jest.fn().mockRejectedValue(new Error('Script load failed'))
        }));

        await expect(loader.load()).rejects.toThrow('Unable to load script. Message: Script load failed');
    });
});
