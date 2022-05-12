import { FormatRules, ValidatorRules } from '../../../utils/Validator/types';
import { isEmpty, getFormattingRegEx } from '../../../utils/validator-utils';

export const phoneValidationRules: ValidatorRules = {
    phoneNumber: {
        modes: ['blur'],
        validate: value => {
            return isEmpty(value) ? null : /^(\d){4,12}$/.test(value);
        },
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
