import { Language } from './Language';

describe('Language', () => {
    test('should thrown an error if locale is not set', () => {
        expect(() => new Language({ locale: null, translations: {} })).toThrowError('Language: "locale" property is not defined');
    });

    test('should set up custom translation for a supported locale', () => {
        const language = new Language({
            locale: 'en-US',
            translations: {
                pay: 'Pay',
                redirect: 'Redirect'
            },
            customTranslations: {
                'en-US': {
                    pay: 'Pay Now'
                }
            }
        });

        expect(language.get('pay')).toBe('Pay Now');
        expect(language.get('redirect')).toBe('Redirect');
    });

    test('should set up a custom locale with custom translation', () => {
        const customTranslations = {
            'ca-CA': {
                'creditCard.numberField.title': 'Card Title'
            }
        };

        const language = new Language({ locale: 'ca-CA', customTranslations, translations: {} });

        expect(language.languageCode).toBe('ca');
        expect(language.get('creditCard.numberField.title')).toBe('Card Title');
    });

    test('should return empty string if the locale translation is empty', () => {
        const language = new Language({ locale: 'en-US', translations: { pay: '' } });
        expect(language.get('pay')).toBe('');
    });

    test('should return translation key if value is not defined', () => {
        const language = new Language({ locale: 'en-US', translations: {} });
        expect(language.get('my-undefined-key')).toBe('my-undefined-key');
    });
});
