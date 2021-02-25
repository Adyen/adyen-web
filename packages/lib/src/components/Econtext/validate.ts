import { telephoneNumber } from '../../utils/regex';
import { ValidatorRules } from '../../utils/Validator/Validator';

export const econtextValidationRules: ValidatorRules = {
    telephoneNumber: [
        {
            validate: value => !!value && value.length <= 11,
            errorMessage: 'voucher.econtext.telephoneNumber.invalid',
            modes: ['input', 'blur']
        },
        {
            validate: value => !!value && telephoneNumber.test(value) && (value.length === 10 || value.length === 11),
            errorMessage: 'voucher.econtext.telephoneNumber.invalid',
            modes: ['blur']
        }
    ]
};
