import { ValidatorRules } from '../../../utils/Validator/FormValidator';

export const addressValidationRules: ValidatorRules = {
    default: {
        validate: value => value && value.length > 0,
        modes: ['blur']
    }
};
