import { getSupportedLocalePayPalV5, getSupportedLocalePayPalV6 } from './get-paypal-locale';

describe('getSupportedLocalePayPalV5', () => {
    test('return the locale in the right format', () => {
        expect(getSupportedLocalePayPalV5('en-US')).toBe('en_US');
    });

    test('return null if the passed locale is not supported', () => {
        expect(getSupportedLocalePayPalV5('es_AR')).toBe(null);
    });
});

describe('getSupportedLocalePayPalV6', () => {
    test('return the locale in the right format', () => {
        expect(getSupportedLocalePayPalV6('en_US')).toBe('en-US');
    });

    test('return the locale unchanged when it already uses the BCP-47 separator', () => {
        expect(getSupportedLocalePayPalV6('fr-FR')).toBe('fr-FR');
    });

    test('return null if the passed locale is not supported', () => {
        expect(getSupportedLocalePayPalV6('es_AR')).toBe(null);
    });
});
