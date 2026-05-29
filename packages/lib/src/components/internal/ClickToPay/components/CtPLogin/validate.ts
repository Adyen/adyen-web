import { ValidatorRules } from '../../../../../utils/Validator/types';

export const loginValidationRules: ValidatorRules = {
    shopperLogin: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'ctp.errors.INVALID_EMAIL',
        modes: ['blur']
    },
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: '',
        modes: ['blur']
    }
};
