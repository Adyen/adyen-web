import { email, telephoneNumber } from '~/utils/regex';
import { unformatDate } from '~/components/internal/FormFields/InputDate/utils';

export const personalDetailsValidationRules = {
    blur: {
        default: value => value && value.length > 0,
        dateOfBirth: value => {
            if (!value) return false;
            const rawValue = unformatDate(value);
            const ageDiff = Date.now() - Date.parse(rawValue);
            const age = new Date(ageDiff).getFullYear() - 1970;
            return age >= 18;
        },
        telephoneNumber: value => telephoneNumber.test(value),
        shopperEmail: value => email.test(value)
    }
};
