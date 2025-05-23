import { PasskeySdkLoader } from './PasskeySdkLoader';
import { getUrlFromMap } from '../../../core/Environment/Environment';
import Script from '../../../utils/Script';

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

    let loader: PasskeySdkLoader;

    beforeEach(() => {
        loader = new PasskeySdkLoader();
        (getUrlFromMap as jest.Mock).mockReturnValue(mockCdnUrl);
        (window as any).AdyenPasskey = mockAdyenPasskey;
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete (window as any).AdyenPasskey;
    });

    it('should load script and set AdyenPasskey', async () => {
        const result = await loader.load(mockEnvironment);

        expect(getUrlFromMap).toHaveBeenCalledWith(mockEnvironment, expect.anything());
        expect(Script).toHaveBeenCalledWith(`${mockCdnUrl}js/adyenpasskey/1.1.0/adyen-passkey.js`);
        expect(result).toBe(mockAdyenPasskey.default);
    });

    it('should return early if AdyenPasskey is already loaded', async () => {
        await loader.load(mockEnvironment); // First time
        const result = await loader.load(mockEnvironment); // Second time

        expect(Script).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockAdyenPasskey.default);
    });

    it('should throw AdyenCheckoutError if script fails to load', async () => {
        (Script as jest.Mock).mockImplementationOnce(() => ({
            load: jest.fn().mockRejectedValue(new Error('Script load failed'))
        }));

        await expect(loader.load(mockEnvironment)).rejects.toThrow('Unable to load script. Message: Script load failed');
    });
});
