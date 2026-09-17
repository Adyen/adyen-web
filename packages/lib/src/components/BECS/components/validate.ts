import { ERROR_FIELD_REQUIRED } from '../../../core/Errors/constants';
import { digitsOnlyFormatter } from '../../../utils/Formatters/formatters';
import { validationRules } from '../../../utils/Validator/defaultRules';
import type { ValidatorRules } from '../../../utils/Validator/types';

export const formatBSB = (value: string): string => {
    return digitsOnlyFormatter(value)
        .slice(0, 6)
        .replace(/^(\d{3})(\d)/, '$1-$2');
};

export const becsValidationRules: ValidatorRules = {
    bankBranchCode: {
        modes: ['blur'],
        validate: value => /^\d{3}-\d{3}$/.test(value)
    },
    shopperEmail: [
        {
            modes: ['blur'],
            validate: value => !!value,
            errorMessage: ERROR_FIELD_REQUIRED
        },
        validationRules.emailRule
    ],
    default: {
        modes: ['blur'],
        validate: value => !!value
    }
};

export const becsFormatters = {
    bankBranchCode: formatBSB,
    bankAccountNumber: digitsOnlyFormatter
};
