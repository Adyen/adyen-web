import { ValidatorRules } from '../../../../utils/Validator/types';
import { ERROR_FIELD_REQUIRED } from '../../../../core/Errors/constants';

export const vpaValidationRules: ValidatorRules = {
    virtualPaymentAddress: {
        validate: value => !!value && value.length > 0,
        errorMessage: ERROR_FIELD_REQUIRED,
        modes: ['blur']
    }
};
