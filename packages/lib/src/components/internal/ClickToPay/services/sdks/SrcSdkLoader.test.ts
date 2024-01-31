import SrcSdkLoader from './SrcSdkLoader';

import VisaSdk from './VisaSdk';
import MastercardSdk from './MastercardSdk';
import AdyenCheckoutError from '../../../../../core/Errors/AdyenCheckoutError';

jest.mock('./VisaSdk');
jest.mock('./MastercardSdk');

describe('load()', () => {
    test('should resolve Promise when all SDKs load sucessfully', async () => {
        jest.spyOn(VisaSdk.prototype, 'loadSdkScript').mockResolvedValueOnce();
        jest.spyOn(MastercardSdk.prototype, 'loadSdkScript').mockResolvedValueOnce();

        const loader = new SrcSdkLoader(['visa', 'mc'], { dpaLocale: 'pt_BR', dpaPresentationName: 'MyStore' });
        const sdks = await loader.load('test');

        expect(VisaSdk).toHaveBeenCalledWith('test', { dpaLocale: 'pt_BR', dpaPresentationName: 'MyStore' });
        expect(MastercardSdk).toHaveBeenCalledWith('test', { dpaLocale: 'pt_BR', dpaPresentationName: 'MyStore' });
        expect(sdks.length).toBe(2);
    });

    test('should reject Promise when all SDKs fail to load', async () => {
        jest.spyOn(VisaSdk.prototype, 'loadSdkScript').mockRejectedValueOnce({});
        jest.spyOn(MastercardSdk.prototype, 'loadSdkScript').mockRejectedValueOnce({});

        const loader = new SrcSdkLoader(['visa', 'mc'], { dpaLocale: 'pt_BR', dpaPresentationName: 'MyStore' });

        expect.assertions(2);

        await loader.load('test').catch(error => {
            expect(error).toBeInstanceOf(AdyenCheckoutError);
            expect(error.message).toContain('ClickToPay -> SrcSdkLoader # Unable to load network schemes');
        });
    });

    test('should resolve when at least one SDK loaded sucessfully', async () => {
        jest.spyOn(VisaSdk.prototype, 'loadSdkScript').mockRejectedValueOnce({});
        jest.spyOn(MastercardSdk.prototype, 'loadSdkScript').mockResolvedValue();

        const loader = new SrcSdkLoader(['visa', 'mc'], { dpaLocale: 'pt_BR', dpaPresentationName: 'MyStore' });
        const sdks = await loader.load('live');

        expect(sdks.length).toBe(1);
        expect(sdks[0]).toBeInstanceOf(MastercardSdk);
    });

    test('should throw error if no schemes are passed', async () => {
        const loader = new SrcSdkLoader([], { dpaLocale: 'pt_BR', dpaPresentationName: 'MyStore' });

        expect.assertions(2);

        await loader.load('test').catch(error => {
            expect(error).toBeInstanceOf(AdyenCheckoutError);
            expect(error.message).toContain('ClickToPay -> SrcSdkLoader: There are no schemes set to be loaded');
        });
    });
});
