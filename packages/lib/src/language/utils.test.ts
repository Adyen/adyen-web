import { formatCustomTranslations, formatLocaleToLanguageCountryLocale, getTranslation, interpolateElement, matchLocale, parseLocale } from './utils';
import { createElement } from 'preact';
import { DEFAULT_LOCALE } from './constants';

describe('matchLocale()', () => {
    const supportedLocales = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'nl-NL'];

    test('should match locale with exact match in supported locales', () => {
        expect(matchLocale('en-US', supportedLocales)).toBe('en-US');
        expect(matchLocale('es-ES', supportedLocales)).toBe('es-ES');
    });

    test('should match locale with same language code but different country code', () => {
        expect(matchLocale('en-GB', supportedLocales)).toBe('en-US');
        expect(matchLocale('es-MX', supportedLocales)).toBe('es-ES');
        expect(matchLocale('fr-CA', supportedLocales)).toBe('fr-FR');
    });

    test('should match locale case-insensitively', () => {
        expect(matchLocale('EN-US', supportedLocales)).toBe('en-US');
        expect(matchLocale('Es-ES', supportedLocales)).toBe('es-ES');
    });

    test('should return null when no match is found', () => {
        expect(matchLocale('ja-JP', supportedLocales)).toBe(null);
        expect(matchLocale('zh-CN', supportedLocales)).toBe(null);
    });

    test('should return null when locale is null', () => {
        // @ts-ignore Testing edge case when string is null
        expect(matchLocale(null, supportedLocales)).toBe(null);
    });

    test('should return null when locale is undefined', () => {
        // @ts-ignore Testing edge case when string is undefined
        expect(matchLocale(undefined, supportedLocales)).toBe(null);
    });

    test('should return null when locale is not a string', () => {
        expect(matchLocale(123 as any, supportedLocales)).toBe(null);
        expect(matchLocale({} as any, supportedLocales)).toBe(null);
        expect(matchLocale([] as any, supportedLocales)).toBe(null);
    });

    test('should return null when locale is empty string', () => {
        expect(matchLocale('', supportedLocales)).toBe(null);
    });

    test('should match first occurrence when multiple locales share language code', () => {
        const localesWithDuplicates = ['en-US', 'en-GB', 'es-ES'];
        expect(matchLocale('en-CA', localesWithDuplicates)).toBe('en-US');
    });
});

describe('formatLocale()', () => {
    test('should return locale when already properly formatted', () => {
        expect(formatLocaleToLanguageCountryLocale('en-US')).toBe('en-US');
        expect(formatLocaleToLanguageCountryLocale('es-ES')).toBe('es-ES');
        expect(formatLocaleToLanguageCountryLocale('fr-FR')).toBe('fr-FR');
    });

    test('should format locale with underscore separator', () => {
        expect(formatLocaleToLanguageCountryLocale('en_US')).toBe('en-US');
        expect(formatLocaleToLanguageCountryLocale('es_ES')).toBe('es-ES');
    });

    test('should format locale with lowercase language and country codes', () => {
        expect(formatLocaleToLanguageCountryLocale('en-us')).toBe('en-US');
        expect(formatLocaleToLanguageCountryLocale('es-es')).toBe('es-ES');
    });

    test('should format locale with uppercase language and country codes', () => {
        expect(formatLocaleToLanguageCountryLocale('EN-US')).toBe('en-US');
        expect(formatLocaleToLanguageCountryLocale('ES-ES')).toBe('es-ES');
    });

    test('should format locale with mixed case', () => {
        expect(formatLocaleToLanguageCountryLocale('En-Us')).toBe('en-US');
        expect(formatLocaleToLanguageCountryLocale('eS-eS')).toBe('es-ES');
    });

    test('should format locale with underscore and mixed case', () => {
        expect(formatLocaleToLanguageCountryLocale('en_us')).toBe('en-US');
        expect(formatLocaleToLanguageCountryLocale('En_Us')).toBe('en-US');
        expect(formatLocaleToLanguageCountryLocale('EN_US')).toBe('en-US');
    });

    test('should return null when language code is missing', () => {
        expect(formatLocaleToLanguageCountryLocale('-US')).toBe(null);
        expect(formatLocaleToLanguageCountryLocale('_US')).toBe(null);
    });

    test('should return null when country code is missing', () => {
        expect(formatLocaleToLanguageCountryLocale('en-')).toBe(null);
        expect(formatLocaleToLanguageCountryLocale('en_')).toBe(null);
    });

    test('should return null when locale has invalid length', () => {
        expect(formatLocaleToLanguageCountryLocale('e-US')).toBe(null);
        expect(formatLocaleToLanguageCountryLocale('en-U')).toBe(null);
        expect(formatLocaleToLanguageCountryLocale('eng-US')).toBe(null);
        expect(formatLocaleToLanguageCountryLocale('en-USA')).toBe(null);
    });

    test('should return null when locale has no separator', () => {
        expect(formatLocaleToLanguageCountryLocale('enUS')).toBe(null);
        expect(formatLocaleToLanguageCountryLocale('esES')).toBe(null);
    });

    test('should return null when locale is empty string', () => {
        expect(formatLocaleToLanguageCountryLocale('')).toBe(null);
    });

    test('should return null when locale has only language code', () => {
        expect(formatLocaleToLanguageCountryLocale('en')).toBe(null);
        expect(formatLocaleToLanguageCountryLocale('es')).toBe(null);
    });
});

describe('parseLocale()', () => {
    const supportedLocales = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'nl-NL'];

    test('should return formatted locale when exact match exists', () => {
        expect(parseLocale('en-US', supportedLocales)).toBe('en-US');
        expect(parseLocale('es-ES', supportedLocales)).toBe('es-ES');
    });

    test('should format and return locale when match exists', () => {
        expect(parseLocale('en_US', supportedLocales)).toBe('en-US');
        expect(parseLocale('EN-us', supportedLocales)).toBe('en-US');
    });

    test('should match by language code when exact locale not supported', () => {
        expect(parseLocale('en-GB', supportedLocales)).toBe('en-US');
        expect(parseLocale('es-MX', supportedLocales)).toBe('es-ES');
    });

    test('should return DEFAULT_LOCALE when locale is null', () => {
        // @ts-ignore Testing edge case when string is null
        expect(parseLocale(null, supportedLocales)).toBe(DEFAULT_LOCALE);
    });

    test('should return DEFAULT_LOCALE when locale is undefined', () => {
        // @ts-ignore Testing edge case when string is undefined
        expect(parseLocale(undefined, supportedLocales)).toBe(DEFAULT_LOCALE);
    });

    test('should return DEFAULT_LOCALE when locale is empty string', () => {
        expect(parseLocale('', supportedLocales)).toBe(DEFAULT_LOCALE);
    });

    test('should return DEFAULT_LOCALE when locale length is less than 1', () => {
        expect(parseLocale('', supportedLocales)).toBe(DEFAULT_LOCALE);
    });

    test('should return DEFAULT_LOCALE when locale length is greater than 5', () => {
        expect(parseLocale('en-US-extra', supportedLocales)).toBe(DEFAULT_LOCALE);
        expect(parseLocale('toolong', supportedLocales)).toBe(DEFAULT_LOCALE);
    });

    test('should return DEFAULT_LOCALE when no match found', () => {
        expect(parseLocale('ja-JP', supportedLocales)).toBe(DEFAULT_LOCALE);
        expect(parseLocale('zh-CN', supportedLocales)).toBe(DEFAULT_LOCALE);
    });

    test('should return DEFAULT_LOCALE when locale cannot be formatted', () => {
        expect(parseLocale('invalid', supportedLocales)).toBe(DEFAULT_LOCALE);
        expect(parseLocale('en', supportedLocales)).toBe(DEFAULT_LOCALE);
    });

    test('should prioritize exact match over language code match', () => {
        const localesWithVariants = ['en-US', 'en-GB'];
        expect(parseLocale('en-GB', localesWithVariants)).toBe('en-GB');
        expect(parseLocale('en-US', localesWithVariants)).toBe('en-US');
    });
});

describe('getTranslation()', () => {
    const translations = { myTranslation: 'My translation', myTranslation__plural: 'My translations', myTranslation__2: 'My two translations' };

    test('should get a translation with a matching key', () => {
        expect(getTranslation(translations, 'myTranslation')).toBe('My translation');
    });

    test('should get a translation with values', () => {
        expect(getTranslation({ myTranslation: 'My %{type} translation' }, 'myTranslation', { values: { type: 'custom' } })).toBe(
            'My custom translation'
        );
    });

    test('should get a translation with empty values', () => {
        expect(getTranslation({ myTranslation: 'My %{type} translation' }, 'myTranslation')).toBe('My  translation');
    });

    test('should get a plural translation if available', () => {
        expect(getTranslation(translations, 'myTranslation', { count: 3 })).toBe('My translations');
    });

    test('should get a specific count translation if available', () => {
        expect(getTranslation(translations, 'myTranslation', { count: 2 })).toBe('My two translations');
    });

    test('should get the default translation if count is not greater than 1', () => {
        expect(getTranslation(translations, 'myTranslation', { count: 1 })).toBe('My translation');
        expect(getTranslation(translations, 'myTranslation', { count: 0 })).toBe('My translation');
        expect(getTranslation(translations, 'myTranslation', { count: -1 })).toBe('My translation');
    });

    test('should get the default translation if count is not provided', () => {
        expect(getTranslation(translations, 'myTranslation')).toBe('My translation');
    });
});

describe('formatCustomTranslations()', () => {
    test('should work when no custom translations are passed', () => {
        expect(formatCustomTranslations({})).toEqual({});
        expect(formatCustomTranslations(undefined)).toEqual({});
    });

    test('should work when custom translations are already in the default supported locales', () => {
        const customTranslations = {
            'en-US': {
                customTranslation: 'customString'
            }
        };

        expect(formatCustomTranslations(customTranslations)).toEqual(customTranslations);
    });

    test('should format the locale when it does not match the expected format', () => {
        const customTranslations = {
            'es-ar': {
                customTranslation: 'customString'
            }
        };

        const expectedCustomTranslations = {
            'es-AR': {
                customTranslation: 'customString'
            }
        };

        expect(formatCustomTranslations(customTranslations)).toEqual(expectedCustomTranslations);
    });
});

describe('interpolateElement()', () => {
    test('it should interpolate the element properly', () => {
        const renderLink = (translation: string) => createElement('a', { href: 'example.com' }, [translation]);
        const result = interpolateElement('By clicking continue %#you%# agree with the %#term and conditions%#', [renderLink, renderLink]);
        expect(typeof result[0] === 'string');
        expect(result[1] === 'a');
        expect(typeof result[2] === 'string');
        expect(result[3] === 'a');
    });

    test('it should throw an error when wrong amount elements', () => {
        const renderLink = (translation: string) => createElement('a', { href: 'example.com' }, [translation]);
        const resultFn = () => interpolateElement('By clicking continue %#you%# agree with the %#term and conditions%#', [renderLink]);
        expect(resultFn).toThrow(Error);
    });
});
