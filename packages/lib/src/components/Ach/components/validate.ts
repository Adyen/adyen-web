import { ValidatorRules } from '../../../utils/Validator/types';

export const achValidationRules: ValidatorRules = {
    selectedAccountType: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'ach.bankAccount.nothing-selected-error',
        modes: ['blur']
    },
    ownerName: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'ach.accountHolderNameField.invalid',
        modes: ['blur']
    },
    routingNumber: [
        {
            validate: value => !!value && value.length === 0,
            errorMessage: 'ach.loc.947',
            modes: ['blur']
        },
        {
            validate: value => !!value && value.length < 9,
            errorMessage: 'ach.loc.948',
            modes: ['blur']
        }
    ],
    accountNumber: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'ach.num.945',
        modes: ['blur']
    },
    accountNumberVerification: [
        {
            /**
             * If the account number is empty, then validate that the field has an empty error state.
             * Otherwise, the other validator will validate if the fields match
             */
            validate: (value, context) => {
                const { accountNumber } = context.state.data;
                return !accountNumber ? !!value && value.length > 0 : true;
            },
            errorMessage: 'ach.bankAccountNumberVerification.error.empty',
            modes: ['blur']
        },
        {
            validate: (value, context) => {
                const { accountNumber } = context.state.data;
                return accountNumber === value;
            },
            errorMessage: 'ach.bankAccountNumberVerification.error.not-match',
            modes: ['blur']
        }
    ],
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: '',
        modes: ['blur']
    }
};
