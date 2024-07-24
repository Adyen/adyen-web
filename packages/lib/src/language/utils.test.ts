import { formatCustomTranslations, formatLocale, getTranslation, interpolateElement } from './utils';
import { createElement } from 'preact';

describe('formatLocale()', () => {
    test('should not do anything if the locale is already formatted', () => {
        expect(formatLocale('en-US')).toBe('en-US');
        expect(formatLocale('es-ES')).toBe('es-ES');
        expect(formatLocale('ar')).toBe('ar');
    });

    test('should throw an error if locale is not properly formatted', () => {
        expect(() => formatLocale('enUS')).toThrowError("Locale 'enUS' does not match the expected format");
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
    test('should throw an error if custom translation has invalid translation key', () => {
        const customTranslations = {
            enUS: {
                customTranslation: 'customString'
            }
        };

        expect(() => expect(formatCustomTranslations(customTranslations))).toThrowError('');
    });

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
