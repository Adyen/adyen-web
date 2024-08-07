import { ValidatorRules } from '../../../../utils/Validator/types';
import validateSSN from '../../../internal/SocialSecurityNumberBrazil/validate';
import { validationRules } from '../../../../utils/Validator/defaultRules';
import { BOLETO_SOCIAL_SECURITY_NUMBER_INVALID, SF_ErrorCodes } from '../../../../core/Errors/constants';

export const boletoValidationRules: ValidatorRules = {
    socialSecurityNumber: {
        validate: validateSSN,
        errorMessage: BOLETO_SOCIAL_SECURITY_NUMBER_INVALID,
        modes: ['blur']
    },
    shopperEmail: validationRules.emailRule,
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: SF_ErrorCodes.ERROR_MSG_INVALID_FIELD,
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
