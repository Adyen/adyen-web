import { ValidatorRules } from '../../../utils/Validator/types';
import { digitsOnlyFormatter } from '../../../utils/Formatters/formatters';
import { personalDetailsValidationRules } from '../../internal/PersonalDetails/validate';

const bankAccountNumberRegEx = /^(\d){1,8}$/;
const bankLocationIdRegEx = /^(\d){6}$/;

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
    shopperEmail: personalDetailsValidationRules.shopperEmail,
    default: {
        modes: ['blur'],
        validate: value => !!value && value.length > 0
    }
};

export const bacsFormatters = {
    bankAccountNumber: digitsOnlyFormatter,
    bankLocationId: digitsOnlyFormatter
};
