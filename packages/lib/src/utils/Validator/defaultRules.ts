import { ValidatorRule } from './types';
import { isEmpty } from '../validator-utils';
import { ERROR_KEY_INVALID, ERROR_KEY_REQUIRED } from '../../core/Errors/constants';
import { email, telephoneNumber } from '../regex';
import { unformatDate } from '../../components/internal/FormFields/InputDate/utils';

const isPhoneValid = (value: string, validationRule: ValidatorRule): boolean | null => {
    if (isEmpty(value)) {
        validationRule.errorMessage = ERROR_KEY_REQUIRED;
        return null;
    }
    validationRule.errorMessage = ERROR_KEY_INVALID;
    return telephoneNumber.test(value);
};

const isEmailValid = (value: string, validationRule: ValidatorRule): boolean | null => {
    if (isEmpty(value)) {
        validationRule.errorMessage = ERROR_KEY_REQUIRED;
        return null;
    }
    validationRule.errorMessage = ERROR_KEY_INVALID;
    return value.length >= 6 && value.length <= 320 && email.test(value);
};

const isDateOfBirthValid = (value: string, validationRule: ValidatorRule): boolean | null => {
    if (!value) {
        validationRule.errorMessage = ERROR_KEY_REQUIRED;
        return false;
    }
    validationRule.errorMessage = 'dateOfBirth.invalid';
    const rawValue = unformatDate(value);
    const ageDiff = Date.now() - Date.parse(rawValue);
    const age = new Date(ageDiff).getFullYear() - 1970;
    return age >= 18;
};

const phoneNumberRule: ValidatorRule = {
    validate: value => isPhoneValid(value, phoneNumberRule),
    modes: ['blur']
};

const emailRule: ValidatorRule = {
    validate: value => isEmailValid(value, emailRule),
    modes: ['blur']
};

const dateOfBirthRule: ValidatorRule = {
    validate: value => isDateOfBirthValid(value, dateOfBirthRule),
    modes: ['blur']
};

export const validationRules = { phoneNumberRule, emailRule, dateOfBirthRule };
