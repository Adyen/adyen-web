import { ValidatorRules } from '../../../utils/Validator/types';
import { isEmpty } from '../../../utils/validator-utils';
import { ErrorCodes } from '../../../core/Errors/constants';

export const companyDetailsValidationRules: ValidatorRules = {
    default: {
        validate: value => {
            return value && value.length > 0;
        },
        modes: ['blur'],
        errorMessage: ErrorCodes.ERROR_MSG_INCOMPLETE_FIELD // = 'err-gen-9100'
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
