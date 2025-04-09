import { ValidatorRules } from '../../../utils/Validator/types';
import { digitsOnlyFormatter } from '../../../utils/Formatters/formatters';
import { isEmpty } from '../../../utils/validator-utils';

const accountNumberRegex = /^\d{4,17}$/;
const routingNumberRegex = /^\d{9}$/;

export const achValidationRules: ValidatorRules = {
    selectedAccountType: {
        validate: value => (isEmpty(value) ? null : true),
        errorMessage: 'ach.bankAccount.nothing-selected-error',
        modes: ['blur']
    },
    ownerName: {
        validate: value => (isEmpty(value) ? null : true),
        errorMessage: 'ach.accountHolderNameField.invalid',
        modes: ['blur']
    },
    routingNumber: [
        // Empty field
        {
            validate: value => (isEmpty(value) ? null : true),
            errorMessage: 'ach.loc.947',
            modes: ['blur']
        },
        // Incomplete field
        {
            validate: value => {
                if (isEmpty(value)) return null;
                return routingNumberRegex.test(value);
            },
            errorMessage: 'ach.loc.948',
            modes: ['blur']
        }
    ],
    accountNumber: [
        // Empty field
        {
            validate: value => (isEmpty(value) ? null : true),
            errorMessage: 'ach.num.945',
            modes: ['blur']
        },
        // Incomplete field: value is not between 4 and 17 chars
        {
            validate: value => {
                if (isEmpty(value)) return null;
                return accountNumberRegex.test(value);
            },
            errorMessage: 'ach.num.946',
            modes: ['blur']
        }
    ],
    accountNumberVerification: [
        {
            /**
             * If the account number is empty, then validate that the field has an empty error state.
             * Otherwise, the other validator will validate if the fields match
             */
            validate: (value, context) => {
                const { accountNumber } = context.state.data;
                return !accountNumber && isEmpty(value) ? null : true;
            },
            errorMessage: 'ach.bankAccountNumberVerification.error.empty',
            modes: ['blur']
        },
        {
            validate: (value, context) => {
                if (isEmpty(value)) return null;
                const { accountNumber } = context.state.data;
                return accountNumber === value;
            },
            errorMessage: 'ach.bankAccountNumberVerification.error.not-match',
            modes: ['blur']
        }
    ]
};

export const achFormatters = {
    routingNumber: digitsOnlyFormatter,
    accountNumber: digitsOnlyFormatter,
    accountNumberVerification: digitsOnlyFormatter
};
