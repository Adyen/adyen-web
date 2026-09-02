import { CountryFormatRules } from './Validator/types';

const MAX_LENGTH = 30;

export const getMaxLengthByFieldAndCountry = (
    formattingRules: CountryFormatRules,
    field: string,
    country: string,
    ignoreIfFormatterExists: boolean
): number | null => {
    // In ignoreIfFormatterExists is true we expect the formatter function to also act to limit length
    if (ignoreIfFormatterExists && formattingRules[country]?.[field]?.formatterFn) {
        return null;
    }
    const maxLength = formattingRules[country]?.[field]?.maxlength;
    return maxLength ? maxLength : MAX_LENGTH;
};

// Not null or undefined or only spaces
export const isEmpty = (input: string) => !!(input == null || /^[\s]*$/.test(input));

export const isString = (input: unknown) => typeof input === 'string' || input instanceof String;
export const hasText = (input: string) => isString(input) && !isEmpty(input);

// Block emojis and control/format characters, allow everything else
const INVALID_CHARS_REGEX_SOURCE = '(?:[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\p{Cc}\\p{Cf}]|[0-9#*]\\uFE0F?\\u20E3)';
const [INVALID_CHARS_TEST, INVALID_CHARS_STRIP] = ((): [RegExp, RegExp] => {
    try {
        // This is inside a try/catch just in case the browser doesn't support Unicode property escapes
        return [new RegExp(INVALID_CHARS_REGEX_SOURCE, 'u'), new RegExp(INVALID_CHARS_REGEX_SOURCE, 'gu')];
    } catch {
        // Fallback for browsers without Unicode property escapes - just block control chars
        const fallbackRegex = '[\\u0000-\\u001F\\u007F-\\u009F]';
        return [new RegExp(fallbackRegex), new RegExp(fallbackRegex, 'g')];
    }
})();

// Generates a regEx ideal for use in a String.replace call for use in a formatter
// e.g. getFormattingRegEx('^\\d', 'g') will generate: /[^\d]/g which is a regEx to match anything that is not a digit
export const getFormattingRegEx = (specChars: string, flags = 'g') => new RegExp(`[${specChars}]`, flags);

export const exactLength = (input: string, length: number) => {
    if (isEmpty(input)) {
        return true;
    }
    return input.length === length;
};

export const validateForSpecialChars = (text: string): boolean => {
    if (!text.length) return true;
    // Returns true if no invalid characters found
    return !INVALID_CHARS_TEST.test(text);
};

export const stripInvalidChars = (text: string): string => text.replace(INVALID_CHARS_STRIP, '');

// Trim both ends and never allow more than 1 space in between
export const trimValWithOneSpace = (val: string) => val.trim().replace(/\s+/g, ' ');
