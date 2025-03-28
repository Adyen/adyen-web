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
    routingNumber: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'ach.loc.947',
        modes: ['blur']
    },
    accountNumber: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'ach.num.945',
        modes: ['blur']
    },
    default: {
        validate: value => !!value && value.length > 0,
        errorMessage: '',
        modes: ['blur']
    }
};
