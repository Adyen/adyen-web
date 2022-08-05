import { ValidatorRules } from '../../../../utils/Validator/types';

export const vpaValidationRules: ValidatorRules = {
    virtualPaymentAddress: {
        validate: value => !!value && value.length > 0,
        errorMessage: '',
        modes: ['blur']
    },
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: '',
        modes: ['blur']
    }
};
