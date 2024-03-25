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

export const SPECIAL_CHARS = '?\\+_=!@#$%^&*(){}~<>\\[\\]\\\\'; // N.B. difficulty escaping \ (takes 3 backslashes!)

// Generates a regEx ideal for use in a String.replace call for use in a formatter
// e.g. getFormattingRegEx('^\\d', 'g') will generate: /[^\d]/g which is a regEx to match anything that is not a digit
export const getFormattingRegEx = (specChars: string, flags = 'g') => new RegExp(`[${specChars}]`, flags);

// Creates a regEx ideal for use in a RegExp.test call for use in a validator
export const getValidatingRegEx = (specChars: string, exclude: boolean) => new RegExp(`^[${exclude ? '^' : ''}${specChars}]+$`);

export const CHARACTER_PATTERNS: { [key: string]: RegExp } = {
    digitsHyphen: /^[\d-]+$/,
    noHtml: /^[^<>&]+$/,
    alphaNum: /^\d[a-zA-Z0-9]{6,11}$/,
    noSpecialChars: getValidatingRegEx(SPECIAL_CHARS, true)
};

export const exactLength = (input: string, length: number) => {
    if (isEmpty(input)) {
        return true;
    }
    return input.length === length;
};

export const validateForSpecialChars = name => {
    const hasNoLength = !name.length;
    // RegEx .test, if run against empty string, will return false
    return CHARACTER_PATTERNS.noSpecialChars.test(name) || hasNoLength;
};

// Trim start and never allow more than 1 space on the end
export const trimValWithOneSpace = (val: string) => val.trimStart().replace(/\s+/g, ' ');
