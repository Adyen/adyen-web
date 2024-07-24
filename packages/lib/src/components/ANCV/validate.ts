import { ValidatorRules } from '../../utils/Validator/types';
import { isEmpty } from '../../utils/validator-utils';
import { email } from '../../utils/regex';

export const isEmailValid = value => {
    if (isEmpty(value)) return null;
    return value.length >= 6 && value.length <= 320 && email.test(value);
};

export const isANCVNumber = text => /^\d{11}$/.test(text);

export const ancvValidationRules: ValidatorRules = {
    beneficiaryId: {
        validate: value => isEmailValid(value) || isANCVNumber(value),
        errorMessage: 'ancv.beneficiaryId.invalid',
        modes: ['blur']
    }
};
