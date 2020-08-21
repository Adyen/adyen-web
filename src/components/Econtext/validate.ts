import { email, telephoneNumber } from '../../utils/regex';
const NON_REQUIRED_ERROR_MESSAGE = ' ';
export const econtextValidationRules = {
    blur: {
        default: value => {
            return { isValid: value && value.length > 0, errorMessage: NON_REQUIRED_ERROR_MESSAGE };
        },
        telephoneNumber: value => {
            return {
                isValid: value && telephoneNumber.test(value) && (value.length === 10 || value.length === 11),
                errorMessage: 'voucher.econtext.telephoneNumber.invalid'
            };
        },
        shopperEmail: value => {
            return {
                isValid: email.test(value),
                errorMessage: NON_REQUIRED_ERROR_MESSAGE
            };
        }
    }
};
