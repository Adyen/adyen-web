import { ValidatorRule } from '../../../../utils/Validator/types';
import { isEmpty } from '../../../../utils/validator-utils';
import { email } from '../../../../utils/regex';
import { ERROR_FIELD_INVALID } from '../../../../core/Errors/constants';

export const optionalEmailValidationRule: ValidatorRule = {
    validate: value => {
        if (isEmpty(value)) {
            return true;
        }
        return value.length >= 6 && value.length <= 320 && email.test(value);
    },
    errorMessage: ERROR_FIELD_INVALID,
    modes: ['blur']
};
