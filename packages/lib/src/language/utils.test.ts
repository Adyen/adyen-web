import { formatCustomTranslations, formatLocale, getTranslation, interpolateElement, matchLocale, parseLocale } from './utils';
import { createElement } from 'preact';
import { SUPPORTED_LOCALES } from './config';

describe('parseLocale()', () => {
    test('should return the passed locale if formatted properly', () => {
        expect(parseLocale('en-US', SUPPORTED_LOCALES)).toBe('en-US');
        expect(parseLocale('zh-TW', SUPPORTED_LOCALES)).toBe('zh-TW');
        expect(parseLocale('zh-CN', SUPPORTED_LOCALES)).toBe('zh-CN');
        expect(parseLocale('da-DK', SUPPORTED_LOCALES)).toBe('da-DK');
    });

    test('should return a properly formatted locale if not formatted', () => {
        const locale = 'En_us';
        expect(parseLocale(locale, SUPPORTED_LOCALES)).toBe('en-US');
    });

    test('should return a properly formatted locale when a partial locale is sent in', () => {
        const locale = 'nl';
        expect(parseLocale(locale, SUPPORTED_LOCALES)).toBe('nl-NL');
    });

    test('should return the FALLBACK_LOCALE when an incorrect locale is sent in', () => {
        expect(parseLocale('default', SUPPORTED_LOCALES)).toBe('en-US');
        expect(parseLocale('english', SUPPORTED_LOCALES)).toBe('en-US');
        expect(parseLocale('spanish', SUPPORTED_LOCALES)).toBe('en-US');
    });

    test('should return FALLBACK_LOCALE when an empty string is send', () => {
        expect(parseLocale('')).toBe('en-US');
    });

    test('should return null when a locale is not matched', () => {
        const locale = 'xx_XX';
        expect(parseLocale(locale, SUPPORTED_LOCALES)).toBe(null);
    });

    test('should return a formatted locale when called with an underscored locale like en_US', () => {
        const locale = 'en_US';
        expect(parseLocale(locale, SUPPORTED_LOCALES)).toBe('en-US');
    });

    test('should return the matched language when called with a non-proper locale like es&ES', () => {
        const locale = 'es&ES';
        expect(parseLocale(locale, SUPPORTED_LOCALES)).toBe('es-ES');
    });
});

describe('matchLocale()', () => {
    test('should match a two letter code', () => {
        expect(matchLocale('en', SUPPORTED_LOCALES)).toBe('en-US');
        expect(matchLocale('es', SUPPORTED_LOCALES)).toBe('es-ES');
    });

    test('should return null if it cannot match the locale', () => {
        expect(matchLocale('ca', SUPPORTED_LOCALES)).toBe(null);
        expect(matchLocale('ne', SUPPORTED_LOCALES)).toBe(null);
        expect(matchLocale('123', SUPPORTED_LOCALES)).toBe(null);
        expect(matchLocale(undefined, SUPPORTED_LOCALES)).toBe(null);
    });
});

describe('formatLocale()', () => {
    test('should not do anything if the locale is already formatted', () => {
        expect(formatLocale('en-US')).toBe('en-US');
        expect(formatLocale('es-ES')).toBe('es-ES');
    });

    test('should return null if the locale is missing a part or it is not properly separated', () => {
        expect(formatLocale('en')).toBe(null);
        expect(formatLocale('enUS')).toBe(null);
    });

    test('should return a formatted locale when called with an underscored locale like en_US', () => {
        expect(formatLocale('en_us')).toBe('en-US');
    });

    test('should return a formatted locale when called with a lowercase locale like en-us', () => {
        expect(formatLocale('en-us')).toBe('en-US');
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
        expect(formatCustomTranslations({}, SUPPORTED_LOCALES)).toEqual({});
        expect(formatCustomTranslations(undefined, SUPPORTED_LOCALES)).toEqual({});
    });

    test('should work when custom translations are already in the defaultSupportedLocales', () => {
        const customTranslations = {
            'en-US': {
                customTranslation: 'customString'
            }
        };

        expect(formatCustomTranslations(customTranslations, SUPPORTED_LOCALES)).toEqual(customTranslations);
    });

    test('should work when custom translations contain a partial ', () => {
        const customTranslations = {
            en: {
                customTranslation: 'customString'
            }
        };

        const expectedCustomTranslations = {
            'en-US': {
                customTranslation: 'customString'
            }
        };

        expect(formatCustomTranslations(customTranslations, SUPPORTED_LOCALES)).toEqual(expectedCustomTranslations);
    });

    test('should format new locales', () => {
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

        expect(formatCustomTranslations(customTranslations, SUPPORTED_LOCALES)).toEqual(expectedCustomTranslations);
    });

    test('should format new locales', () => {
        const customTranslations = {
            'ca-ca': {
                customTranslation: 'customString'
            }
        };

        const expectedCustomTranslations = {
            'ca-CA': {
                customTranslation: 'customString'
            }
        };

        expect(formatCustomTranslations(customTranslations, SUPPORTED_LOCALES)).toEqual(expectedCustomTranslations);
    });

    test('should format new partial locales if properly added in the defaultSupportedLocales', () => {
        const customTranslations = {
            ca: {
                customTranslation: 'customString'
            }
        };
        const defaultSupportedLocales = ['es-ES', 'ca-CA'];
        const expectedCustomTranslations = {
            'ca-CA': {
                customTranslation: 'customString'
            }
        };

        expect(formatCustomTranslations(customTranslations, defaultSupportedLocales)).toEqual(expectedCustomTranslations);
    });
});

describe('interpolateElement()', () => {
    test('it should interpolate the element properly', () => {
        const renderLink = translation => createElement('a', { href: 'example.com' }, [translation]);
        const result = interpolateElement('By clicking continue %#you%# agree with the %#term and conditions%#', [renderLink, renderLink]);
        expect(typeof result[0] === 'string');
        expect(result[1] === 'a');
        expect(typeof result[2] === 'string');
        expect(result[3] === 'a');
    });

    test('it should throw an error when wrong amount elements', () => {
        const renderLink = translation => createElement('a', { href: 'example.com' }, [translation]);
        const resultFn = () => interpolateElement('By clicking continue %#you%# agree with the %#term and conditions%#', [renderLink]);
        expect(resultFn).toThrow(Error);
    });
});
