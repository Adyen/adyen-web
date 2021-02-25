import { ValidatorRules } from '../../../utils/Validator/Validator';

export const addressValidationRules: ValidatorRules = {
    default: {
        validate: value => value && value.length > 0,
        modes: ['blur']
    }
};
