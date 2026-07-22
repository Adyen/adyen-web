import { Language } from './Language';
import type { ILanguageService } from './LanguageService';

describe('Language', () => {
    const mockService: ILanguageService = {
        fetchTranslationsFromCdn: jest.fn().mockResolvedValue({})
    };

    describe('Locale parsing', () => {
        test('should use en-US when locale is en', () => {
            const language = new Language({ locale: 'en', service: mockService });
            expect(language.locale).toBe('en-US');
            expect(language.languageCode).toBe('en');
        });

        test('should use en-US when locale is en-GB', () => {
            const language = new Language({ locale: 'en-GB', service: mockService });
            expect(language.locale).toBe('en-US');
            expect(language.languageCode).toBe('en');
        });

        test('should use en-US as default when locale is not recognized', () => {
            const language = new Language({ locale: 'xx-XX', service: mockService });
            expect(language.locale).toBe('en-US');
            expect(language.languageCode).toBe('en');
        });

        test('should match with the closest locale when locale is not exact', () => {
            const language = new Language({ locale: 'es-MX', service: mockService });
            expect(language.locale).toBe('es-ES');
            expect(language.languageCode).toBe('es');
        });

        test('should use arabic locale if set', () => {
            const language = new Language({ locale: 'ar', service: mockService });
            expect(language.locale).toBe('ar');
            expect(language.languageCode).toBe('ar');
        });

        test('should use custom locale when custom translations are passed for that locale', () => {
            const customTranslations = {
                'ca-CA': {
                    'creditCard.numberField.title': 'Card Title'
                }
            };
            const language = new Language({ locale: 'ca-CA', service: mockService, customTranslations });
            expect(language.locale).toBe('ca-CA');
            expect(language.languageCode).toBe('ca');
        });

        test('should not use custom locale if there are no custom translations for that locale', () => {
            const customTranslations = {
                'ca-CA': {
                    'creditCard.numberField.title': 'Card Title'
                }
            };
            const language = new Language({ locale: 'fr-CA', service: mockService, customTranslations });
            expect(language.locale).toBe('fr-FR');
            expect(language.languageCode).toBe('fr');
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
