import { CountryFormatRules } from './Validator/types';

const MAX_LENGTH = 30;

export const getMaxLengthByFieldAndCountry = (
    formattingRules: CountryFormatRules,
    field: string,
    country: string,
    ignoreIfFormatterExists: boolean
): number | null => {
    // In ignoreIfFormatterExists is true we expect the formatter function to also act to limit length
    if (ignoreIfFormatterExists && formattingRules[country]?.[field]?.formatter) {
        return null;
    }
    const maxLength = formattingRules[country]?.[field]?.maxlength;
    return maxLength ? maxLength : MAX_LENGTH;
};

export const SPECIAL_CHARS = '?\\-\\+_=!@#$%^&*(){}~<>\\[\\]\\/\\\\'; // N.B. difficulty escaping \

// Generates a regEx ideal for use in a String.replace call for use in a formatter
export const getFormattingRegEx = (specChars: string, flags = 'g') => new RegExp(`[${specChars}]`, flags);

// Trim start, end, and never allow more than 1 space between
export const trimValWithOneSpace = (val: string) => val.trimStart().trimEnd().replace(/\s+/g, ' ');