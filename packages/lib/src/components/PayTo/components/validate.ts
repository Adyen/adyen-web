import { ValidatorRule, ValidatorRules } from '../../../utils/Validator/types';
import { isEmpty } from '../../../utils/validator-utils';
import { ERROR_FIELD_INVALID, ERROR_FIELD_REQUIRED } from '../../../core/Errors/constants';

const abnRegex = /^((\d{9})|(\d{11}))$/;

const orgidRegex = /`^[!-@[-~][ -@[-~]{0,254}[!-@[-~]$`/;

const emailRegex =
    /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;

// Full phone number regex with country code: ^+\[0-9\]{1,3}-\[1-9\]{1,1}\[0-9\]{1,29}$
const phoneNumberRegexWithoutCountryCode = /^[0-9]{1,29}$/;

export const validationFromRegex = (value: string, regex: RegExp, validationRule: ValidatorRule): boolean | null => {
    // null is returned here for legacy reasons
    // check comment on hasError() ValidatorRulesResult.ts:17
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
            return isEmpty(value) ? null : phoneNumberRegexWithoutCountryCode.test(value);
        },
        errorMessage: 'mobileNumber.invalid'
    },
    phonePrefix: {
        modes: ['blur'],
        validate: phonePrefix => !!phonePrefix,
        errorMessage: 'mobileNumber.invalid'
    }
};

//original regex /^\d{6}-[ -~]{1,28}$/
const bsbRegex = /^\d{6}$/;
const bankAccountNumberRegex = /^[ -~]{1,28}$/;

const bsbValidatorRule: ValidatorRule = {
    validate: value => validationFromRegex(value, bsbRegex, bsbValidatorRule),
    errorMessage: 'bsb.invalid',
    modes: ['blur']
};

const bankAccountNumberValidatorRule: ValidatorRule = {
    validate: value => validationFromRegex(value, bankAccountNumberRegex, bankAccountNumberValidatorRule),
    errorMessage: 'bankAccountNumber.invalid',
    modes: ['blur']
};

export const bsbValidationRules: ValidatorRules = {
    bsb: bsbValidatorRule,
    bankAccountNumber: bankAccountNumberValidatorRule,
    firstName: {
        validate: value => (isEmpty(value) ? null : true), // valid, if there are chars other than spaces,
        errorMessage: 'firstName.invalid',
        modes: ['blur']
    },
    lastName: {
        validate: value => (isEmpty(value) ? null : true),
        errorMessage: 'lastName.invalid',
        modes: ['blur']
    }
};
