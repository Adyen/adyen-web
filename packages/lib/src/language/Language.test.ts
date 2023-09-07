import { Language } from './Language';

describe('Language', () => {
    describe('constructor', () => {
        test('sets up locale and customTranslations', () => {
            const customTranslations = {
                'es-ES': {
                    'creditCard.numberField.title': 'es'
                }
            };

            const lang = new Language('es-ES', customTranslations);

            expect(lang.locale).toBe('es-ES');
            expect(lang.customTranslations['es-ES']).toBeDefined();
        });

        test('sets up locale without country code and customTranslations without countryCode', () => {
            const customTranslations = {
                es: {
                    'creditCard.numberField.title': 'es'
                }
            };

            const lang = new Language('es', customTranslations);

            expect(lang.locale).toBe('es-ES');
            expect(lang.customTranslations['es-ES']).toBeDefined();
        });

        test('sets up a custom locale and customTranslations', () => {
            const customTranslations = {
                'ca-CA': {
                    'creditCard.numberField.title': 'ca'
                }
            };

            const lang = new Language('ca-CA', customTranslations);

            expect(lang.locale).toBe('ca-CA');
            expect(lang.customTranslations['ca-CA']).toBeDefined();
        });

        test('sets up a custom locale without countryCode and customTranslations', () => {
            const customTranslations = {
                'ca-CA': {
                    'creditCard.numberField.title': 'ca'
                }
            };

            const lang = new Language('ca', customTranslations);

            expect(lang.locale).toBe('ca-CA');
            expect(lang.customTranslations['ca-CA']).toBeDefined();
        });

        test('falls back to FALLBACK_LOCALE and removes customTranslations that do not match a language/language_country code', () => {
            const customTranslations = {
                FAKE: {
                    'creditCard.numberField.title': 'ca'
                }
            };

            const lang = new Language('FAKE', customTranslations);

            expect(lang.locale).toBe('en-US');
            expect(lang.customTranslations).toEqual({});
        });
    });

    // describe('get', () => {
    //     test('gets a string even if it is empty', () => {
    //         const i18n = new Language('en-US', {
    //             'en-US': {
    //                 test: ''
    //             }
    //         });
    //
    //         i18n.loaded.then(() => {
    //             expect(i18n.get('test')).toBe('');
    //         });
    //     });
    // });
});
