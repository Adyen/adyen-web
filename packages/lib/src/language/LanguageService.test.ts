import { LanguageService } from './LanguageService';
import { httpGet } from '../core/Services/http';
import enUS from '../../../server/translations/en-US.json';
import type { Translations } from './types';

jest.mock('../core/Services/http', () => ({
    httpGet: jest.fn()
}));

const mockHttpGet = httpGet as jest.MockedFunction<typeof httpGet>;

describe('LanguageService', () => {
    const cdnUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/';
    const sdkVersion = '5.0.0';

    let service: LanguageService;
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
        service = new LanguageService({ cdnUrl, sdkVersion });
        jest.clearAllMocks();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const expectEnUSFallbackWithoutHttpCall = (result: Translations) => {
        expect(result).toBe(enUS);
        expect(mockHttpGet).not.toHaveBeenCalled();
    };

    describe('fetchTranslationsFromCdn()', () => {
        describe('bundled en-US translations', () => {
            test('should return bundled en-US translations without making HTTP request', async () => {
                const result = await service.fetchTranslationsFromCdn('en-US');

                expectEnUSFallbackWithoutHttpCall(result);
            });

            test('should return bundled en-US translations for en-GB (matches to en-US)', async () => {
                const result = await service.fetchTranslationsFromCdn('en-GB');

                expectEnUSFallbackWithoutHttpCall(result);
            });
        });

        describe('CDN translation fetching', () => {
            test('should fetch fr-FR translations from CDN', async () => {
                const mockTranslations: Translations = { 'pay.button': 'Payer' };
                mockHttpGet.mockResolvedValueOnce(mockTranslations);

                const result = await service.fetchTranslationsFromCdn('fr-FR');

                expect(result).toEqual(mockTranslations);
                expect(mockHttpGet).toHaveBeenCalledWith({
                    loadingContext: cdnUrl,
                    errorLevel: 'fatal',
                    errorMessage: 'Translations: Failed to fetch translations for locale "fr-FR"',
                    path: `sdk/${sdkVersion}/translations/fr-FR.json`
                });
            });

            test('should perform locale matching before making a request (e.g. fr-CH to fr-FR)', async () => {
                const mockTranslations: Translations = { 'pay.button': 'Payer' };
                mockHttpGet.mockResolvedValueOnce(mockTranslations);

                const result = await service.fetchTranslationsFromCdn('fr-CH');

                expect(result).toEqual(mockTranslations);
                expect(mockHttpGet).toHaveBeenCalledWith(
                    expect.objectContaining({
                        path: `sdk/${sdkVersion}/translations/fr-FR.json`
                    })
                );
            });

            test('should use provided sdkVersion and cdnUrl', async () => {
                const customVersion = '6.1.2';
                const customCdnUrl = 'https://custom-cdn.example.com/';
                const customService = new LanguageService({ cdnUrl: customCdnUrl, sdkVersion: customVersion });
                const mockTranslations: Translations = { 'pay.button': 'Test' };
                mockHttpGet.mockResolvedValueOnce(mockTranslations);

                await customService.fetchTranslationsFromCdn('fr-FR');

                expect(mockHttpGet).toHaveBeenCalledWith(
                    expect.objectContaining({
                        loadingContext: customCdnUrl,
                        path: 'sdk/6.1.2/translations/fr-FR.json'
                    })
                );
            });
        });

        describe('fallback behavior', () => {
            test('should fallback to en-US for unsupported locale (xx-XX)', async () => {
                const result = await service.fetchTranslationsFromCdn('xx-XX');

                expectEnUSFallbackWithoutHttpCall(result);
            });

            test('should return en-US fallback on network error', async () => {
                mockHttpGet.mockRejectedValueOnce(new Error('Network error'));

                const result = await service.fetchTranslationsFromCdn('fr-FR');

                expect(result).toBe(enUS);
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    'LanguageService - fetchTranslationsFromCdn(): Failed to fetch locale "fr-FR."',
                    expect.any(Error)
                );
            });
        });

        describe('edge cases', () => {
            test('should handle empty string locale', async () => {
                const result = await service.fetchTranslationsFromCdn('');

                expectEnUSFallbackWithoutHttpCall(result);
            });

            test('should handle undefined locale', async () => {
                const result = await service.fetchTranslationsFromCdn(undefined as unknown as string);

                expectEnUSFallbackWithoutHttpCall(result);
            });

            test('should handle whitespace-only locale', async () => {
                const result = await service.fetchTranslationsFromCdn('   ');

                expectEnUSFallbackWithoutHttpCall(result);
            });

            test('should handle locale with invalid format', async () => {
                const result = await service.fetchTranslationsFromCdn('invalid-locale-format');

                expectEnUSFallbackWithoutHttpCall(result);
            });
        });
    });
});
