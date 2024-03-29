import { ValidatorRules } from '../../../../utils/Validator/types';
import validateSSN from '../../../internal/SocialSecurityNumberBrazil/validate';
import { personalDetailsValidationRules } from '../../../internal/PersonalDetails/validate';

export const boletoValidationRules: ValidatorRules = {
    socialSecurityNumber: {
        validate: validateSSN,
        errorMessage: 'error.va.gen.02',
        modes: ['blur']
    },
    shopperEmail: personalDetailsValidationRules.shopperEmail,
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'error.va.gen.02',
        modes: ['blur']
    },
    firstName: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'firstName.invalid',
        modes: ['blur']
    },
    lastName: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'lastName.invalid',
        modes: ['blur']
    }
};
