import { email } from '../../../utils/regex';

const bankAccountNumberRegEx = /^(\d){1,8}$/;
const bankLocationIdRegEx = /^(\d){6}$/;
const nonDigitRegEx = /[^0-9]/g;

export const bacsValidationRules: object = {
    input: {
        bankAccountNumber: (num): object => {
            // Format
            const formattedVal: string = num.replace(nonDigitRegEx, '');
            // Validate
            const isValid: boolean = bankAccountNumberRegEx.test(formattedVal);

            return { isValid, value: formattedVal, showError: false };
        },
        bankLocationId: (num): object => {
            // Format
            const formattedVal: string = num.replace(nonDigitRegEx, '');
            // Validate
            const isValid: boolean = bankLocationIdRegEx.test(formattedVal);

            return { isValid, value: formattedVal, showError: false };
        },
        shopperEmail: value => {
            return { isValid: email.test(value), value, errorMessage: true };
        },
        default: value => ({ isValid: value && value.length > 0, value })
    },
    blur: {
        bankAccountNumber: (num): object => {
            // Just validate
            return { isValid: bankAccountNumberRegEx.test(num), value: num, showError: true };
        },
        bankLocationId: (num): object => {
            // Just validate
            return { isValid: bankLocationIdRegEx.test(num), value: num, showError: true };
        },
        shopperEmail: value => {
            return { isValid: email.test(value), value, errorMessage: true };
        },
        default: value => ({ isValid: value && value.length > 0, value })
    }
};
