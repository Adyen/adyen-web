import { email, telephoneNumber } from '../../../utils/regex';
import { unformatDate } from '../FormFields/InputDate/utils';

const isDateOfBirthValid = value => {
    if (!value) return false;
    const rawValue = unformatDate(value);
    const ageDiff = Date.now() - Date.parse(rawValue);
    const age = new Date(ageDiff).getFullYear() - 1970;
    return age >= 18;
};

export const personalDetailsValidationRules = {
    blur: {
        default: value => {
            const isValid: boolean = value && value.length > 0;
            return { isValid: isValid, errorMessage: true };
        },
        dateOfBirth: value => {
            return { isValid: isDateOfBirthValid(value), errorMessage: 'dateOfBirth.invalid' };
        },
        telephoneNumber: value => {
            return { isValid: telephoneNumber.test(value), errorMessage: true };
        },
        shopperEmail: value => {
            return { isValid: email.test(value), errorMessage: true };
        }
    }
};
