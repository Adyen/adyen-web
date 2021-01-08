import { getCheckoutLocale } from './utils';

describe('getCheckoutLocale', () => {
    test('should return the fallback for the passed region if the locale is not supported', () => {
        expect(getCheckoutLocale('en_US', 'EU')).toBe('en_GB');
        expect(getCheckoutLocale('en_GB', 'US')).toBe('en_US');
        expect(getCheckoutLocale('xx_XX', 'EU')).toBe('en_GB');
        expect(getCheckoutLocale('xx_XX', 'US')).toBe('en_US');
    });
});
