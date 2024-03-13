import { ValidatorRules } from '../../../utils/Validator/types';
import { isEmpty } from '../../../utils/validator-utils';
import { ERROR_FIELD_REQUIRED } from '../../../core/Errors/constants';
import { validationRules } from '../../../utils/Validator/defaultRules';

export const personalDetailsValidationRules: ValidatorRules = {
    default: {
        validate: value => {
            return value && value.length > 0;
        },
        errorMessage: ERROR_FIELD_REQUIRED,
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
    dateOfBirth: validationRules.dateOfBirthRule,
    telephoneNumber: validationRules.phoneNumberRule,
    shopperEmail: validationRules.emailRule
};
