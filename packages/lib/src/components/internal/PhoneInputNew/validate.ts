import { FormatRules, ValidatorRules } from '../../../utils/Validator/types';
import { isEmpty, getFormattingRegEx } from '../../../utils/validator-utils';

// ((+351|00351|351)?)(2\d{1}|(9(3|6|2|1)))\d{7} full portuguese phone num regex

const portugueseRegex = /\b(2\d{1}|(9(3|6|2|1)))\d{7}\b/; // match 2 + any digit + 7 digits OR 9 + 3|6|2|1 + 7 digits
const defaultRegex = /^(\d){4,}$/; // match >= 4 digits

export const phoneValidationRules: ValidatorRules = {
    phoneNumber: {
        modes: ['blur'],
        validate: (value, context) => {
            // TODO improve this switching mechanism *if* we get any more country based regexs
            const testRegex = context.state.data.phonePrefix === '+351' ? portugueseRegex : defaultRegex;

            return isEmpty(value) ? null : testRegex.test(value);
        },
        errorMessage: 'invalidPhoneNumber'
    },
    phonePrefix: {
        modes: ['blur'],
        validate: phonePrefix => !!phonePrefix,
        errorMessage: 'invalidCountryCode'
    }
};

export const phoneFormatters: FormatRules = {
    phoneNumber: {
        formatterFn: val => val.replace(getFormattingRegEx('^\\d', 'g'), '')
    }
};
