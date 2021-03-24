import { ValidatorRules } from '../../../utils/Validator/Validator';

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
        modes: ['blur']
    }
});
