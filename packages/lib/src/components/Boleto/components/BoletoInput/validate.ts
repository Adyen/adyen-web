import { ValidatorRules } from '../../../../utils/Validator/Validator';

export const boletoValidationRules: ValidatorRules = {
    socialSecurityNumber: {
        validate: ssn => /(^\d{3}\.\d{3}\.\d{3}-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$)/.test(ssn),
        errorMessage: '',
        modes: ['blur']
    },
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: '',
        modes: ['blur']
    }
};
