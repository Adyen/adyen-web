import { ValidatorRules } from '../../../../utils/Validator/types';
import validateSSN from '../../../internal/SocialSecurityNumberBrazil/validate';
import { validationRules } from '../../../../utils/Validator/defaultRules';
import { TrafficLight } from '../../../../core/Errors/constants';

export const boletoValidationRules: ValidatorRules = {
    socialSecurityNumber: {
        validate: validateSSN,
        errorMessage: TrafficLight.ERROR_MSG_INVALID_FIELD, // = 'err-gen-9101',
        modes: ['blur']
    },
    shopperEmail: validationRules.emailRule,
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: TrafficLight.ERROR_MSG_INVALID_FIELD,
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
