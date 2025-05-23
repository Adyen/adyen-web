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
    bankAccountNumber: [
        // Empty field
        {
            validate: value => (isEmpty(value) ? null : true),
            errorMessage: 'eftpad-canada.input.accountNumber.error',
            modes: ['blur']
        },
        // Incomplete field
        {
            validate: value => {
                if (isEmpty(value)) return null;
                return bankAccountNumberRegex.test(value);
            },
            errorMessage: 'eftpad-canada.input.accountNumber.error',
            modes: ['blur']
        }
    ],
    bankCode: [
        // Empty field
        {
            validate: value => (isEmpty(value) ? null : true),
            errorMessage: 'eftpad-canada.input.institutionNumber.error',
            modes: ['blur']
        },
        // Incomplete field
        {
            validate: value => {
                if (isEmpty(value)) return null;
                return bankCodeRegex.test(value);
            },
            errorMessage: 'eftpad-canada.input.institutionNumber.error',
            modes: ['blur']
        }
    ],
    bankLocationId: [
        // Empty field
        {
            validate: value => (isEmpty(value) ? null : true),
            errorMessage: 'eftpad-canada.input.transitNumber.error',
            modes: ['blur']
        },
        // Incomplete field
        {
            validate: value => {
                if (isEmpty(value)) return null;
                return bankLocationIdRegex.test(value);
            },
            errorMessage: 'eftpad-canada.input.transitNumber.error',
            modes: ['blur']
        }
    ]
};

export const preAuthorizedDebitCanadaFormatters = {
    bankAccountNumber: digitsOnlyFormatter,
    bankCode: digitsOnlyFormatter,
    bankLocationId: digitsOnlyFormatter
};
