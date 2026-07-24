import { getSupportedLocalePayPalV5 } from './get-paypal-locale';

describe('getSupportedLocalePayPalV5', () => {
    test('return the locale in the right format', () => {
        expect(getSupportedLocalePayPalV5('en-US')).toBe('en_US');
    });

    test('return null if the passed locale is not supported', () => {
        expect(getSupportedLocalePayPalV5('es_AR')).toBe(null);
    });
});
