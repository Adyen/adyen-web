import { getStyle, getSupportedLocale } from './utils';

describe('getStyle', () => {
    test('return the same styles for the regular PayPal button', () => {
        const style = { color: 'gold', height: 48 };
        expect(getStyle('paypal', style)).toEqual(style);
    });

    test('remove the unsupported color for PayPal Credit', () => {
        const style = { color: 'gold', height: 48 };
        expect(getStyle('credit', style)).toEqual({ height: 48 });
    });
});

describe('getSupportedLocale', () => {
    test('return the locale in the right format', () => {
        expect(getSupportedLocale('en-US')).toBe('en_US');
    });

    test('return null if the passed locale is not supported', () => {
        expect(getSupportedLocale('es_AR')).toBe(null);
    });
});
