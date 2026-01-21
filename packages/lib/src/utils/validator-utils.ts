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
export const isEmpty = input => !!(input == null || /^[\s]*$/.test(input));

export const isString = input => typeof input === 'string' || input instanceof String;
export const hasText = input => isString(input) && !isEmpty(input);

// Block emojis and control/format characters, allow everything else
let INVALID_CHARS_REGEX: RegExp;
try {
    INVALID_CHARS_REGEX = new RegExp('[\\p{Extended_Pictographic}\\p{Cc}\\p{Cf}]', 'gu');
} catch {
    // Fallback for browsers without Unicode property escapes - just block control chars
    // eslint-disable-next-line no-control-regex
    INVALID_CHARS_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;
}

export { INVALID_CHARS_REGEX };

// Generates a regEx ideal for use in a String.replace call for use in a formatter
// e.g. getFormattingRegEx('^\\d', 'g') will generate: /[^\d]/g which is a regEx to match anything that is not a digit
export const getFormattingRegEx = (specChars: string, flags = 'g') => new RegExp(`[${specChars}]`, flags);

// Creates a regEx ideal for use in a RegExp.test call for use in a validator
export const getValidatingRegEx = (specChars: string, exclude: boolean) => new RegExp(`^[${exclude ? '^' : ''}${specChars}]+$`);

export const CHARACTER_PATTERNS: { [key: string]: RegExp } = {
    digitsHyphen: /^[\d-]+$/,
    noHtml: /^[^<>&]+$/,
    alphaNum: /^\d[a-zA-Z0-9]{6,11}$/
};

export const exactLength = (input: string, length: number) => {
    if (isEmpty(input)) {
        return true;
    }
    return input.length === length;
};

export const validateForInvalidChars = (name: string): boolean => {
    if (!name.length) return true;
    // Returns true if no invalid characters found
    return !INVALID_CHARS_REGEX.test(name);
};

// Trim start and never allow more than 1 space on the end
export const trimValWithOneSpace = (val: string) => val.trimStart().replace(/\s+/g, ' ');
