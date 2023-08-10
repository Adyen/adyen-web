import { email, telephoneNumber } from '../../../utils/regex';
import { unformatDate } from '../FormFields/InputDate/utils';
import { ValidatorRules } from '../../../utils/Validator/types';
import { isEmpty } from '../../../utils/validator-utils';

const isDateOfBirthValid = value => {
    if (!value) return false;
    const rawValue = unformatDate(value);
    const ageDiff = Date.now() - Date.parse(rawValue);
    const age = new Date(ageDiff).getFullYear() - 1970;
    return age >= 18;
};
export const isEmailValid = value => {
    if (isEmpty(value)) return null;
    return value.length >= 6 && value.length <= 320 && email.test(value);
};
export const personalDetailsValidationRules: ValidatorRules = {
    default: {
        validate: value => {
            return value && value.length > 0;
        },
        errorMessage: 'error.va.gen.02', // = "field not valid"
        modes: ['blur']
    },
    gender: {
        validate: value => value && value.length > 0,
        errorMessage: 'gender.notselected',
        modes: ['blur']
    },
    firstName: {
        validate: value => (isEmpty(value) ? null : true), // valid, if there are chars other than spaces,
        errorMessage: 'firstName.invalid',
        modes: ['blur']
    },
    lastName: {
        validate: value => (isEmpty(value) ? null : true),
        errorMessage: 'lastName.invalid',
        modes: ['blur']
    },
    dateOfBirth: {
        validate: value => (isEmpty(value) ? null : isDateOfBirthValid(value)),
        errorMessage: 'dateOfBirth.invalid',
        modes: ['blur']
    },
    telephoneNumber: {
        validate: value => (isEmpty(value) ? null : telephoneNumber.test(value)),
        errorMessage: 'telephoneNumber.invalid',
        modes: ['blur']
    },
    shopperEmail: {
        // If it's empty it's not in error, else, is it a valid email?
        validate: value => isEmailValid(value),
        errorMessage: 'shopperEmail.invalid',
        modes: ['blur']
    }
};
