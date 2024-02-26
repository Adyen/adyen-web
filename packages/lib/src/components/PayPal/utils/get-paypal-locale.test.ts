import { getSupportedLocale } from './get-paypal-locale';

describe('getSupportedLocale', () => {
    test('return the locale in the right format', () => {
        expect(getSupportedLocale('en-US')).toBe('en_US');
    });

    test('return null if the passed locale is not supported', () => {
        expect(getSupportedLocale('es_AR')).toBe(null);
    });
});
