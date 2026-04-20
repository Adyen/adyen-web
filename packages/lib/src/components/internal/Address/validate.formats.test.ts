import { countrySpecificFormatters } from './validate.formats';

describe('countrySpecificFormatters', () => {
    describe('BR postalCode formatterFn', () => {
        const format = countrySpecificFormatters.BR.postalCode.formatterFn;

        test('should limit to 9 characters when hyphen is present', () => {
            expect(format('12345-678')).toBe('12345-678');
        });

        test('should limit to 8 characters when no hyphen is present', () => {
            expect(format('12345678')).toBe('12345678');
        });

        test('should truncate digits-only input beyond 8 characters', () => {
            expect(format('123456789')).toBe('12345678');
        });

        test('should truncate hyphenated input beyond 9 characters', () => {
            expect(format('12345-6789')).toBe('12345-678');
        });

        test('should handle empty string', () => {
            expect(format('')).toBe('');
        });
    });

    describe('PL postalCode formatterFn', () => {
        const format = countrySpecificFormatters.PL.postalCode.formatterFn;

        test('should limit to 6 characters when hyphen is present', () => {
            expect(format('12-345')).toBe('12-345');
        });

        test('should limit to 5 characters when no hyphen is present', () => {
            expect(format('12345')).toBe('12345');
        });

        test('should truncate digits-only input beyond 5 characters', () => {
            expect(format('123456')).toBe('12345');
        });

        test('should truncate hyphenated input beyond 6 characters', () => {
            expect(format('12-3456')).toBe('12-345');
        });

        test('should handle empty string', () => {
            expect(format('')).toBe('');
        });
    });

    describe('US postalCode formatterFn', () => {
        const format = countrySpecificFormatters.US.postalCode.formatterFn;

        test('should limit to 10 characters when hyphen is present', () => {
            expect(format('12345-6789')).toBe('12345-6789');
        });

        test('should limit to 5 characters when no hyphen is present', () => {
            expect(format('12345')).toBe('12345');
        });

        test('should truncate digits-only input beyond 5 characters', () => {
            expect(format('123456')).toBe('12345');
        });

        test('should truncate hyphenated input beyond 10 characters', () => {
            expect(format('12345-67890')).toBe('12345-6789');
        });

        test('should handle empty string', () => {
            expect(format('')).toBe('');
        });
    });
});
