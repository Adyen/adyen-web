import { ValidatorRules } from '../../../utils/Validator/types';

const bankAccountNumberRegEx = /^(\d){1,8}$/;
const bankLocationIdRegEx = /^(\d){6}$/;
const nonDigitRegEx = /[^0-9]/g;

export const bacsValidationRules: ValidatorRules = {
    bankAccountNumber: {
        modes: ['blur', 'input'],
        validate: value => !!value && bankAccountNumberRegEx.test(value)
    },
    bankLocationId: [
        {
            modes: ['input'],
            validate: value => !!value && /^(\d){1,6}$/.test(value)
        },
        {
            modes: ['blur'],
            validate: value => !!value && bankLocationIdRegEx.test(value)
        }
    ],
    amountConsentCheckbox: {
        modes: ['blur'],
        validate: value => !!value
    },
    accountConsentCheckbox: {
        modes: ['blur'],
        validate: value => !!value
    },
    default: {
        modes: ['blur'],
        validate: value => !!value && value.length > 0
    }
};

export const bacsFormatters = {
    bankAccountNumber: value => value.replace(nonDigitRegEx, ''),
    bankLocationId: value => value.replace(nonDigitRegEx, '')
};
