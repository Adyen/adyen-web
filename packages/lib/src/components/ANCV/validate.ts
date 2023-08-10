import { ValidatorRules } from '../../utils/Validator/types';
import { isEmailValid } from '../internal/PersonalDetails/validate';

export const isANCVNumber = text => /^\d{11}$/.test(text);

export const ancvValidationRules: ValidatorRules = {
    beneficiaryId: {
        validate: value => isEmailValid(value) || isANCVNumber(value),
        errorMessage: 'shopperEmail.invalid',
        modes: ['blur']
    }
};
