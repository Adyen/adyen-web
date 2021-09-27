import { ValidatorRules } from '../../../utils/Validator/Validator';
import { ERROR_CODES, ERROR_MSG_INCOMPLETE_FIELD } from '../../../core/Errors/constants';

export const getAddressValidationRules = (specifications): ValidatorRules => ({
    houseNumberOrName: {
        validate: (value, context) => {
            const selectedCountry = context.state?.data?.country;
            const isOptional = selectedCountry && specifications.countryHasOptionalField(selectedCountry, 'houseNumberOrName');
            return isOptional || value?.length > 0;
        },
        modes: ['blur']
    },
    default: {
        validate: value => value?.length > 0,
        modes: ['blur'],
        errorMessage: ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD]
    }
});
