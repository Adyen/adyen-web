import { ValidatorRules } from '../../../../utils/Validator/types';
import validateSSN from '../../../internal/SocialSecurityNumberBrazil/validate';
import { personalDetailsValidationRules } from '../../../internal/PersonalDetails/validate';

export const boletoValidationRules: ValidatorRules = {
    socialSecurityNumber: {
        validate: validateSSN,
        errorMessage: '',
        modes: ['blur']
    },
    shopperEmail: personalDetailsValidationRules.shopperEmail,
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: '',
        modes: ['blur']
    }
};
