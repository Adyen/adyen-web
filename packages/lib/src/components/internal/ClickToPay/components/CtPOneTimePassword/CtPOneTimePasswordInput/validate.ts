import { ValidatorRules } from '../../../../../../utils/Validator/types';

export const otpValidationRules: ValidatorRules = {
    otp: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'field.error.required',
        modes: ['blur']
    },
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'field.error.required',
        modes: ['blur']
    }
};
