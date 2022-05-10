import { FormatRules, ValidatorRules } from '../../../utils/Validator/types';
// import { getFormattingRegEx } from '../../../utils/validatorUtils';

// Generates a regEx ideal for use in a String.replace call for use in a formatter
export const getFormattingRegEx = (specChars: string, flags = 'g') => new RegExp(`[${specChars}]`, flags);

export const phoneValidationRules: ValidatorRules = {
    phoneNumber: {
        modes: ['blur'],
        validate: phoneNumber => /^(\d){4,12}$/.test(phoneNumber),
        errorMessage: 'invalidPhoneNumber'
    },
    phonePrefix: {
        modes: ['blur'],
        validate: phonePrefix => !!phonePrefix,
        errorMessage: 'invalidCountryCode'
    }
};

export const phoneFormatters: FormatRules = {
    phoneNumber: {
        formatter: val => val.replace(getFormattingRegEx('^\\d', 'g'), '')
    }
};
