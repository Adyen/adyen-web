import { INVALID_CHARS_REGEX, validateForInvalidChars } from './validator-utils';

describe('INVALID_CHARS_REGEX', () => {
    beforeEach(() => {
        // Reset lastIndex for global regex
        INVALID_CHARS_REGEX.lastIndex = 0;
    });

    describe('blocks emojis', () => {
        it('should match emoji presentation characters', () => {
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('😀')).toBe(true);
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('🎉')).toBe(true);
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('❤️')).toBe(true);
        });

        it('should match emojis within text', () => {
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('Hello 😀 World')).toBe(true);
        });
    });

    describe('blocks control characters', () => {
        it('should match null character', () => {
            expect(INVALID_CHARS_REGEX.test('\u0000')).toBe(true);
        });

        it('should match backspace', () => {
            expect(INVALID_CHARS_REGEX.test('\u0008')).toBe(true);
        });

        it('should match escape character', () => {
            expect(INVALID_CHARS_REGEX.test('\u001B')).toBe(true);
        });
    });

    describe('allows valid address characters', () => {
        it('should not match regular letters', () => {
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('Hello World')).toBe(false);
        });

        it('should not match numbers', () => {
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('12345')).toBe(false);
        });

        it('should not match hash symbol (used in Singapore addresses)', () => {
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('#01-23')).toBe(false);
        });

        it('should not match common address punctuation', () => {
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('123 Main St., Apt #4')).toBe(false);
        });

        it('should not match international characters', () => {
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('Müller Straße')).toBe(false);
        });

        it('should not match Japanese addresses with dashes', () => {
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('東京都渋谷区1-2-3')).toBe(false);
        });

        it('should not match Arabic text', () => {
            INVALID_CHARS_REGEX.lastIndex = 0;
            expect(INVALID_CHARS_REGEX.test('شارع الملك')).toBe(false);
        });
    });
});

describe('validateForInvalidChars', () => {
    it('should return true for empty string', () => {
        expect(validateForInvalidChars('')).toBe(true);
    });

    it('should return true for valid address text', () => {
        expect(validateForInvalidChars('123 Main Street')).toBe(true);
        expect(validateForInvalidChars('#01-23 Building Name')).toBe(true);
        expect(validateForInvalidChars('東京都渋谷区1-2-3')).toBe(true);
    });

    it('should return false for text containing emojis', () => {
        INVALID_CHARS_REGEX.lastIndex = 0;
        expect(validateForInvalidChars('Hello 😀')).toBe(false);
        INVALID_CHARS_REGEX.lastIndex = 0;
        expect(validateForInvalidChars('🏠 Home')).toBe(false);
    });

    it('should return false for text containing control characters', () => {
        expect(validateForInvalidChars('Hello\u0000World')).toBe(false);
    });
});
