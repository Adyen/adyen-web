import { ValidatorRules } from '../../../../utils/Validator/types';
import { ERROR_FIELD_REQUIRED } from '../../../../core/Errors/constants';
import { isEmpty } from '../../../../utils/validator-utils';

export const vpaValidationRules: ValidatorRules = {
    virtualPaymentAddress: {
        validate: value => (isEmpty(value) ? null : true),
        errorMessage: ERROR_FIELD_REQUIRED,
        modes: ['blur']
    }
};
