import { ValidatorRules, ValidatorRule } from '../../../utils/Validator/types';
import { countrySpecificFormatters } from './validate.formats';
import { ERROR_FIELD_REQUIRED, ERROR_INVALID_FORMAT_EXPECTS } from '../../../core/Errors/constants';
import { isEmpty } from '../../../utils/validator-utils';

const createPatternByDigits = (digits: number) => {
    return {
        pattern: new RegExp(`\\d{${digits}}`)
    };
};

const validatePostalCode = (val: string, countryCode: string, validatorRules: ValidatorRules) => {
    if (countryCode) {
        // If there is no value, we display the 'required' error message
        if (isEmpty(val)) return null;

        // Dynamically create errorMessage
        (validatorRules.postalCode as ValidatorRule).errorMessage = {
            translationKey: ERROR_INVALID_FORMAT_EXPECTS,
            translationObject: {
                values: {
                    format: countrySpecificFormatters[countryCode]?.postalCode.format || null
                }
            }
        };

        const pattern = postalCodePatterns[countryCode]?.pattern;
        return pattern ? pattern.test(val) : !!val; // No pattern? Accept any, filled, value.
    }
    // Default rule
    return isEmpty(val) ? null : true;
};

const postalCodePatterns = {
    AT: createPatternByDigits(4),
    AU: createPatternByDigits(4),
    BE: { pattern: /(?:(?:[1-9])(?:\d{3}))/ },
    BG: createPatternByDigits(4),
    BR: { pattern: /^\d{5}-?\d{3}$/ },
    CA: { pattern: /(?:[ABCEGHJ-NPRSTVXY]\d[A-Z][ -]?\d[A-Z]\d)/ },
    CH: { pattern: /[1-9]\d{3}/ },
    CY: createPatternByDigits(4),
    CZ: { pattern: /\d{3}\s?\d{2}/ },
    DE: createPatternByDigits(5),
    DK: createPatternByDigits(4),
    EE: createPatternByDigits(5),
    ES: { pattern: /(?:0[1-9]|[1-4]\d|5[0-2])\d{3}/ },
    FI: createPatternByDigits(5),
    FR: createPatternByDigits(5),
    GB: { pattern: /^([A-Za-z][A-Ha-hK-Yk-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2})$/ },
    GE: createPatternByDigits(4),
    GR: { pattern: /^\d{3}\s{0,1}\d{2}$/ },
    HR: { pattern: /^([1-5])[0-9]{4}$/ },
    HU: createPatternByDigits(4),
    IE: { pattern: /(?:^[AC-FHKNPRTV-Y][0-9]{2}|D6W)[ -]?[0-9AC-FHKNPRTV-Y]{4}/ },
    IS: createPatternByDigits(3),
    IT: createPatternByDigits(5),
    LI: createPatternByDigits(4),
    LT: { pattern: /^(LT-\d{5})$/ },
    LU: createPatternByDigits(4),
    LV: { pattern: /^(LV-)[0-9]{4}$/ },
    MC: { pattern: /^980\d{2}$/ },
    MT: { pattern: /^[A-Za-z]{3}\d{4}$/ },
    MY: createPatternByDigits(5),
    NL: { pattern: /(?:NL-)?(?:[1-9]\d{3} ?(?:[A-EGHJ-NPRTVWXZ][A-EGHJ-NPRSTVWXZ]|S[BCEGHJ-NPRTVWXZ]))/ },
    NO: createPatternByDigits(4),
    PL: { pattern: /^\d{2}[-]{0,1}\d{3}$/ },
    PT: { pattern: /^([1-9]\d{3})([- ]?(\d{3})? *)$/ },
    RO: createPatternByDigits(6),
    SI: createPatternByDigits(4),
    SE: createPatternByDigits(5),
    SG: createPatternByDigits(6),
    SK: createPatternByDigits(5),
    US: createPatternByDigits(5)
};

/**
 * Validates only postalCode property. As the partial address form does not have the country selector, the country value
 * must be informed beforehand and can't be picked up from the form context
 *
 * @param country - Country that will be used to validate postal code
 */
export const getPartialAddressValidationRules = (country: string): ValidatorRules => {
    const validationRules: ValidatorRules = {
        postalCode: {
            modes: ['blur'],
            validate: val => {
                return validatePostalCode(val, country, validationRules);
            },
            errorMessage: ERROR_FIELD_REQUIRED
        }
    };
    return validationRules;
};

export const getAddressValidationRules = (specifications): ValidatorRules => {
    const addressValidationRules: ValidatorRules = {
        postalCode: {
            modes: ['blur'],
            validate: (val, context) => {
                const country = context.state.data.country;
                return validatePostalCode(val, country, addressValidationRules);
            },
            errorMessage: ERROR_FIELD_REQUIRED
        },
        houseNumberOrName: {
            validate: (value, context) => {
                const selectedCountry = context.state?.data?.country;
                const isOptional = selectedCountry && specifications.countryHasOptionalField(selectedCountry, 'houseNumberOrName');
                return isOptional || (isEmpty(value) ? null : true);
            },
            modes: ['blur'],
            errorMessage: ERROR_FIELD_REQUIRED
        },
        default: {
            validate: value => (isEmpty(value) ? null : true), // true, if there are chars other than spaces
            modes: ['blur'],
            errorMessage: ERROR_FIELD_REQUIRED
        }
    };
    return addressValidationRules;
};
