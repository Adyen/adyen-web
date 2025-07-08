import { ValidatorRules } from '../../../utils/Validator/types';
import { digitsOnlyFormatter } from '../../../utils/Formatters/formatters';
import { isEmpty } from '../../../utils/validator-utils';

const bankAccountNumberRegex = /^\d{7,12}$/;
const bankCodeRegex = /^\d{3}$/;
const bankLocationIdRegex = /^\d{5}$/;

export const preAuthorizedDebitCanadaValidationRules: ValidatorRules = {
    ownerName: {
        validate: value => (isEmpty(value) ? null : true),
        errorMessage: 'eftpad-canada.input.accountHolderName.error',
        modes: ['blur']
    },
    bankAccountNumber: {
        validate: value => (isEmpty(value) ? null : bankAccountNumberRegex.test(value)),
        errorMessage: 'eftpad-canada.input.accountNumber.error',
        modes: ['blur']
    },
    bankCode: {
        validate: value => (isEmpty(value) ? null : bankCodeRegex.test(value)),
        errorMessage: 'eftpad-canada.input.institutionNumber.error',
        modes: ['blur']
    },
    bankLocationId: {
        validate: value => (isEmpty(value) ? null : bankLocationIdRegex.test(value)),
        errorMessage: 'eftpad-canada.input.transitNumber.error',
        modes: ['blur']
    }
};

export const preAuthorizedDebitCanadaFormatters = {
    bankAccountNumber: digitsOnlyFormatter,
    bankCode: digitsOnlyFormatter,
    bankLocationId: digitsOnlyFormatter
};
