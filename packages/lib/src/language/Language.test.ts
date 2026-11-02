import { Language } from './Language';
import type { ILanguageService } from './LanguageService';

describe('Language', () => {
    const mockService: ILanguageService = {
        fetchTranslationsFromCdn: jest.fn().mockResolvedValue({})
    };

    describe('Translations locale', () => {
        test('should use en-US when locale is en', () => {
            const language = new Language({ locale: 'en', service: mockService });
            expect(language.translationsLocale).toBe('en-US');
            expect(language.languageCode).toBe('en');
        });

        test('should use en-US when locale is en-GB', () => {
            const language = new Language({ locale: 'en-GB', service: mockService });
            expect(language.translationsLocale).toBe('en-US');
            expect(language.languageCode).toBe('en');
        });

        test('should use en-US as default when locale is not recognized', () => {
            const language = new Language({ locale: 'xx-XX', service: mockService });
            expect(language.translationsLocale).toBe('en-US');
            expect(language.languageCode).toBe('en');
        });

        test('should match with the closest locale when locale is not exact', () => {
            const language = new Language({ locale: 'es-MX', service: mockService });
            expect(language.translationsLocale).toBe('es-ES');
            expect(language.languageCode).toBe('es');
        });

        test('should use arabic locale if set', () => {
            const language = new Language({ locale: 'ar', service: mockService });
            expect(language.translationsLocale).toBe('ar');
            expect(language.languageCode).toBe('ar');
        });

        test('should use custom locale when custom translations are passed for that locale', () => {
            const customTranslations = {
                'ca-CA': {
                    'creditCard.numberField.title': 'Card Title'
                }
            };
            const language = new Language({ locale: 'ca-CA', service: mockService, customTranslations });
            expect(language.translationsLocale).toBe('ca-CA');
            expect(language.languageCode).toBe('ca');
        });

        test('should not use custom locale if there are no custom translations for that locale', () => {
            const customTranslations = {
                'ca-CA': {
                    'creditCard.numberField.title': 'Card Title'
                }
            };
            const language = new Language({ locale: 'fr-CA', service: mockService, customTranslations });
            expect(language.translationsLocale).toBe('fr-FR');
            expect(language.languageCode).toBe('fr');
        });

        test('should use en-US when no locale is passed', () => {
            const language = new Language({ service: mockService });
            expect(language.translationsLocale).toBe('en-US');
            expect(language.languageCode).toBe('en');
        });
    });

    describe('Formatting locale', () => {
        test('should keep the requested locale even when the translations fall back to another one', () => {
            const language = new Language({ locale: 'en-GB', service: mockService });
            expect(language.locale).toBe('en-GB');
            expect(language.translationsLocale).toBe('en-US');
        });

        test('should keep locales longer than five characters', () => {
            const language = new Language({ locale: 'zh-Hans-CN', service: mockService });
            expect(language.locale).toBe('zh-Hans-CN');
        });

        test('should use en-US when no locale is passed', () => {
            const language = new Language({ service: mockService });
            expect(language.locale).toBe('en-US');
        });

        test('should format an amount using the requested locale', () => {
            expect(new Language({ locale: 'en-IN', service: mockService }).amount(15550943, 'INR')).toBe('₹1,55,509.43');
            expect(new Language({ locale: 'es-MX', service: mockService }).amount(15550943, 'MXN')).toBe('$155,509.43');
            // de-CH separates the currency code with a non-breaking space
            expect(new Language({ locale: 'de-CH', service: mockService }).amount(15550943, 'CHF')).toBe("CHF\u00a0155'509.43");
        });

        test('should format a date using the requested locale', () => {
            expect(new Language({ locale: 'en-GB', service: mockService }).date('2026-03-09T00:00:00')).toBe('09/03/2026');
            expect(new Language({ locale: 'en-US', service: mockService }).date('2026-03-09T00:00:00')).toBe('03/09/2026');
        });

        test('should format a date and time using the requested locale', () => {
            expect(new Language({ locale: 'en-GB', service: mockService }).dateTime('2026-03-09T14:30:00')).toBe('09/03/2026, 14:30');
            expect(new Language({ locale: 'en-US', service: mockService }).dateTime('2026-03-09T14:30:00')).toBe('03/09/2026, 2:30 PM');
        });

        test('should use and format with en-US when the requested locale is not supported by Intl', () => {
            const language = new Language({ locale: 'xx-YY', service: mockService });
            expect(language.locale).toBe('en-US');
            expect(language.amount(15550943, 'EUR')).toBe('€155,509.43');
            expect(language.date('2026-03-09T00:00:00')).toBe('03/09/2026');
        });
    });

    describe('Translations creation', () => {
        test('should request translations passing the expected locale', async () => {
            const fetchSpy = jest.fn().mockResolvedValue({ testKey: 'Test Value' });
            const service: ILanguageService = {
                fetchTranslationsFromCdn: fetchSpy
            };

            const language = new Language({ locale: 'es-ES', service });
            await language.requestTranslations();

            expect(fetchSpy).toHaveBeenCalledWith('es-ES');
            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });

        test('should request the translations of the matched locale when the requested one has none', async () => {
            const fetchSpy = jest.fn().mockResolvedValue({});
            const service: ILanguageService = {
                fetchTranslationsFromCdn: fetchSpy
            };

            const language = new Language({ locale: 'en-GB', service });
            await language.requestTranslations();

            expect(fetchSpy).toHaveBeenCalledWith('en-US');
            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });

        test('should merge the fetched locale with the built-in english locale', async () => {
            const fetchedTranslations = {
                payButton: 'Pagar',
                address: 'Endereço'
            };
            const service: ILanguageService = {
                fetchTranslationsFromCdn: jest.fn().mockResolvedValue(fetchedTranslations)
            };

            const language = new Language({ locale: 'pt-BR', service });
            await language.requestTranslations();

            expect(language.get('payButton')).toBe('Pagar');
            expect(language.get('address')).toBe('Endereço');
            expect(language.get('close')).toBe('Close');
        });

        test('should merge the fetched locale with the custom translations', async () => {
            const fetchedTranslations = {
                payButton: 'Pagar'
            };
            const customTranslations = {
                'pt-BR': {
                    payButton: 'Pagar agora',
                    close: 'Fechar'
                }
            };
            const service: ILanguageService = {
                fetchTranslationsFromCdn: jest.fn().mockResolvedValue(fetchedTranslations)
            };

            const language = new Language({ locale: 'pt-BR', service, customTranslations });
            await language.requestTranslations();

            expect(language.get('payButton')).toBe('Pagar agora');
            expect(language.get('close')).toBe('Fechar');
            expect(language.get('address')).toBe('Address');
        });

        test('should merge the fetched translations with custom translations even if the provided custom translation has the wrong case', async () => {
            const fetchedTranslations = {
                payButton: 'Betaal'
            };

            const customTranslations = {
                'nl-ar': {
                    payButton: 'BETAAL'
                }
            };

            const service: ILanguageService = {
                fetchTranslationsFromCdn: jest.fn().mockResolvedValue(fetchedTranslations)
            };

            const language = new Language({ locale: 'nl-AR', service, customTranslations });
            await language.requestTranslations();

            expect(language.get('payButton')).toBe('BETAAL');
        });

        test('should support custom translations for two letter code locales (e.g. "ar")', async () => {
            const fetchedTranslations = {
                payButton: 'دفع'
            };

            const customTranslations = {
                ar: {
                    payButton: 'Pay!'
                }
            };

            const service: ILanguageService = {
                fetchTranslationsFromCdn: jest.fn().mockResolvedValue(fetchedTranslations)
            };

            const language = new Language({ locale: 'ar', service, customTranslations });
            await language.requestTranslations();

            expect(language.locale).toBe('ar');
            expect(language.get('payButton')).toBe('Pay!');
        });
    });
});
