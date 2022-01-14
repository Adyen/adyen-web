import { email, telephoneNumber } from '../../../utils/regex';
import { unformatDate } from '../FormFields/InputDate/utils';
import { ValidatorRules } from '../../../utils/Validator/types';

const isDateOfBirthValid = value => {
    if (!value) return false;
    const rawValue = unformatDate(value);
    const ageDiff = Date.now() - Date.parse(rawValue);
    const age = new Date(ageDiff).getFullYear() - 1970;
    return age >= 18;
};

export const personalDetailsValidationRules: ValidatorRules = {
    default: {
        validate: value => value && value.length > 0,
        modes: ['blur']
    },
    dateOfBirth: {
        validate: value => isDateOfBirthValid(value),
        errorMessage: 'dateOfBirth.invalid',
        modes: ['blur']
    },
    telephoneNumber: {
        validate: value => telephoneNumber.test(value),
        modes: ['blur']
    },
    shopperEmail: {
        validate: value => email.test(value),
        modes: ['blur']
    }
};
