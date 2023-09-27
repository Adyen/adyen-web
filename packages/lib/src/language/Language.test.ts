import { Language } from './Language';
import ar from './locales/ar';

describe('Language', () => {
    test('should use en-US as fallback if "locale" is not passed', () => {
        const language = new Language('', {});

        expect(language.locale).toBe('en-US');
        expect(language.languageCode).toBe('en');
        expect(language.customTranslations).toStrictEqual({});
        expect(language.get('payButton')).toBe('Pay');
    });

    test('should console warn if "locale" is not en-US and no translationFile is set', () => {
        jest.spyOn(console, 'warn').mockImplementation();
        new Language('pt-BR');

        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("'translationFile' missing"));
    });

    test('should use en-US translations as fallback if "locale" is set to pt-BR but translationFile is not provided', () => {
        const language = new Language('pt-BR');
        expect(language.get('payButton')).toBe('Pay');
    });

    test('should parse "ar" as locale', () => {
        const language = new Language('ar', {}, ar);
        expect(language.get('payButton')).toBe('دفع');
    });

    test('should set up customTranslation for locale', () => {
        const customTranslation = {
            'en-US': {
                payButton: 'Pay now'
            }
        };
        const language = new Language('en-US', customTranslation);

        expect(language.customTranslations['en-US'].payButton).toBeDefined();
        expect(language.get('payButton')).toBe('Pay now');
    });

    test('should set up locale without country code and customTranslations without countryCode', () => {
        const customTranslations = {
            es: {
                'creditCard.numberField.title': 'es'
            }
        };
        const lang = new Language('es', customTranslations);

        expect(lang.locale).toBe('es-ES');
        expect(lang.customTranslations['es-ES']).toBeDefined();
    });

    test('should set up custom locale with custom translation', () => {
        const customTranslations = {
            'ca-CA': {
                'creditCard.numberField.title': 'Card Title'
            }
        };

        const lang = new Language('ca-CA', customTranslations);

        expect(lang.locale).toBe('ca-CA');
        expect(lang.customTranslations['ca-CA']).toBeDefined();
        expect(lang.get('creditCard.numberField.title')).toBe('Card Title');
    });

    test('should return empty string if the locale translation is empty', () => {
        const customTranslation = {
            'en-US': {
                payButton: ''
            }
        };
        const language = new Language('en-US', customTranslation);
        expect(language.get('payButton')).toBe('');
    });

    test('should return translation key if value is not defined', () => {
        const language = new Language('en-US');
        expect(language.get('my-undefined-key')).toBe('my-undefined-key');
    });
});
