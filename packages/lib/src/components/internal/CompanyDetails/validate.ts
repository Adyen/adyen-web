import { ValidatorRules } from '../../../utils/Validator/types';
import { isEmpty } from '../../../utils/validator-utils';

export const companyDetailsValidationRules: ValidatorRules = {
    default: {
        validate: value => {
            return value && value.length > 0;
        },
        modes: ['blur'],
        errorMessage: 'error.va.gen.01' // = "Incomplete field"
    },
    name: {
        validate: value => (isEmpty(value) ? null : true), // valid, if there are chars other than spaces
        errorMessage: 'companyDetails.name.invalid',
        modes: ['blur']
    },
    registrationNumber: {
        validate: value => (isEmpty(value) ? null : true),
        errorMessage: 'companyDetails.registrationNumber.invalid',
        modes: ['blur']
    }
};
