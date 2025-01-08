import { ValidatorRule, ValidatorRules } from '../../../utils/Validator/types';
import { isEmpty } from '../../../utils/validator-utils';
import { ERROR_FIELD_INVALID, ERROR_FIELD_REQUIRED } from '../../../core/Errors/constants';

const abnRegex = /^((\d{9})|(\d{11}))$/;

const orgidRegex = /`^[!-@[-~][ -@[-~]{0,254}[!-@[-~]$`/;

const emailRegex =
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)$/;

// full phone regex Phone: ^\+[0-9]{1,3}-[1-9]{1,1}[0-9]{1,29}$
const phoneNumberRegex = /^[1-9]{1,1}[0-9]{1,29}$/;

export const validationFromRegex = (value: string, regex: RegExp, validationRule: ValidatorRule): boolean | null => {
    // TODO investigate why null is the return value for 'empty' validation
    if (isEmpty(value)) {
        validationRule.errorMessage = ERROR_FIELD_REQUIRED;
        return null;
    }
    validationRule.errorMessage = ERROR_FIELD_INVALID;
    return regex.test(value);
};

const emailValidatorRule: ValidatorRule = {
    validate: value => validationFromRegex(value, emailRegex, emailValidatorRule),
    errorMessage: 'abn.invalid',
    modes: ['blur']
};

const abnValidatorRule: ValidatorRule = {
    validate: value => validationFromRegex(value, abnRegex, abnValidatorRule),
    errorMessage: 'abn.invalid',
    modes: ['blur']
};

const orgidValidatorRule: ValidatorRule = {
    validate: value => validationFromRegex(value, orgidRegex, orgidValidatorRule),
    errorMessage: 'orgid.invalid',
    modes: ['blur']
};

export const payIdValidationRules: ValidatorRules = {
    default: {
        validate: value => {
            return value && value.length > 0;
        },
        errorMessage: ERROR_FIELD_REQUIRED,
        modes: ['blur']
    },
    email: emailValidatorRule,
    abn: abnValidatorRule,
    orgid: orgidValidatorRule,
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
    phoneNumber: {
        modes: ['blur'],
        validate: value => {
            return isEmpty(value) ? null : phoneNumberRegex.test(value);
        },
        errorMessage: 'mobileNumber.invalid'
    },
    phonePrefix: {
        modes: ['blur'],
        validate: phonePrefix => !!phonePrefix,
        errorMessage: 'mobileNumber.invalid'
    }
};
