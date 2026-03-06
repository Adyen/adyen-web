import { validateForSpecialChars } from './validator-utils';

describe('validateForSpecialChars', () => {
    describe('returns true for valid input', () => {
        it('should return true for empty string', () => {
            expect(validateForSpecialChars('')).toBe(true);
        });

        it('should return true for regular letters', () => {
            expect(validateForSpecialChars('Hello World')).toBe(true);
        });

        it('should return true for numbers', () => {
            expect(validateForSpecialChars('12345')).toBe(true);
        });

        it('should return true for hash symbol (used in Singapore addresses)', () => {
            expect(validateForSpecialChars('#01-23')).toBe(true);
        });

        it('should return true for common address punctuation', () => {
            expect(validateForSpecialChars('123 Main St., Apt #4')).toBe(true);
        });

        it('should return true for international characters', () => {
            expect(validateForSpecialChars('Müller Straße')).toBe(true);
        });

        it('should return true for Japanese addresses with dashes', () => {
            expect(validateForSpecialChars('東京都渋谷区1-2-3')).toBe(true);
        });

        it('should return true for Arabic text', () => {
            expect(validateForSpecialChars('شارع الملك')).toBe(true);
        });
    });

    describe('returns false for invalid input containing emojis', () => {
        it('should return false for emoji-only text', () => {
            expect(validateForSpecialChars('😀')).toBe(false);
            expect(validateForSpecialChars('🎉')).toBe(false);
            expect(validateForSpecialChars('❤️')).toBe(false);
        });

        it('should return false for text containing emojis', () => {
            expect(validateForSpecialChars('Hello 😀 World')).toBe(false);
            expect(validateForSpecialChars('🏠 Home')).toBe(false);
        });
    });

    describe('returns false for invalid input containing control characters', () => {
        it('should return false for null character', () => {
            expect(validateForSpecialChars('\u0000')).toBe(false);
        });

        it('should return false for backspace', () => {
            expect(validateForSpecialChars('\u0008')).toBe(false);
        });

        it('should return false for escape character', () => {
            expect(validateForSpecialChars('\u001B')).toBe(false);
        });

        it('should return false for text containing control characters', () => {
            expect(validateForSpecialChars('Hello\u0000World')).toBe(false);
        });
    });
});
