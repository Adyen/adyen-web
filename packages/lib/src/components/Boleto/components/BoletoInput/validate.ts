import { ValidatorRules } from '../../../../utils/Validator/Validator';
import validateSSN from '../SocialSecurityNumberBrazil/validate';
export const boletoValidationRules: ValidatorRules = {
    socialSecurityNumber: {
        validate: validateSSN,
        errorMessage: '',
        modes: ['blur']
    },
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: '',
        modes: ['blur']
    }
};
