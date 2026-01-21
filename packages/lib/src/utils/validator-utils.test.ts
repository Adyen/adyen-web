import { hasInvalidChars } from './validator-utils';

describe('hasInvalidChars', () => {
    describe('returns true for valid input', () => {
        it('should return true for empty string', () => {
            expect(hasInvalidChars('')).toBe(true);
        });

        it('should return true for regular letters', () => {
            expect(hasInvalidChars('Hello World')).toBe(true);
        });

        it('should return true for numbers', () => {
            expect(hasInvalidChars('12345')).toBe(true);
        });

        it('should return true for hash symbol (used in Singapore addresses)', () => {
            expect(hasInvalidChars('#01-23')).toBe(true);
        });

        it('should return true for common address punctuation', () => {
            expect(hasInvalidChars('123 Main St., Apt #4')).toBe(true);
        });

        it('should return true for international characters', () => {
            expect(hasInvalidChars('Müller Straße')).toBe(true);
        });

        it('should return true for Japanese addresses with dashes', () => {
            expect(hasInvalidChars('東京都渋谷区1-2-3')).toBe(true);
        });

        it('should return true for Arabic text', () => {
            expect(hasInvalidChars('شارع الملك')).toBe(true);
        });
    });

    describe('returns false for invalid input containing emojis', () => {
        it('should return false for emoji-only text', () => {
            expect(hasInvalidChars('😀')).toBe(false);
            expect(hasInvalidChars('🎉')).toBe(false);
            expect(hasInvalidChars('❤️')).toBe(false);
        });

        it('should return false for text containing emojis', () => {
            expect(hasInvalidChars('Hello 😀 World')).toBe(false);
            expect(hasInvalidChars('🏠 Home')).toBe(false);
        });
    });

    describe('returns false for invalid input containing control characters', () => {
        it('should return false for null character', () => {
            expect(hasInvalidChars('\u0000')).toBe(false);
        });

        it('should return false for backspace', () => {
            expect(hasInvalidChars('\u0008')).toBe(false);
        });

        it('should return false for escape character', () => {
            expect(hasInvalidChars('\u001B')).toBe(false);
        });

        it('should return false for text containing control characters', () => {
            expect(hasInvalidChars('Hello\u0000World')).toBe(false);
        });
    });
});
