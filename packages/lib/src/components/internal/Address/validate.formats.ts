import { CountryFormatRules, FormatRules } from '../../../utils/Validator/types';
import { Formatter } from '../../../utils/useForm/types';
import { getFormattingRegEx, SPECIAL_CHARS, trimValWithOneSpace } from '../../../utils/validator-utils';

const createFormatByDigits = (digits: number): Formatter => {
    const format = new Array(digits).fill('9').join('');
    return {
        // Formatter - excludes non digits and limits to maxlength
        formatterFn: val => val.replace(getFormattingRegEx('^\\d', 'g'), '').substr(0, digits),
        format,
        maxlength: digits
    };
};

const specialCharsRegEx = getFormattingRegEx(SPECIAL_CHARS);
const formattingFn = val => trimValWithOneSpace(val).replace(specialCharsRegEx, '');

export const addressFormatters: FormatRules = {
    postalCode: {
        formatterFn: (val, context) => {
            const country = context.state.data.country;

            // Country specific formatting rule
            const specificRule = countrySpecificFormatters[country]?.postalCode.formatterFn;
            if (specificRule) {
                return specificRule(val);
            }

            // Default formatting rule: allow anything
            return val;
        }
    },
    street: {
        formatterFn: formattingFn
    },
    houseNumberOrName: {
        formatterFn: formattingFn
    },
    city: {
        formatterFn: formattingFn
    }
};

// TODO make proper formatter fns for those entries that don't just have a straightforward, x number of digits, no spaces, format
//  check against our internal documentation on address postal code
//  which, for example, says BR isn't just 8 digits (it can be spilt by a hyphen) & CZ can also be 5 digits, no spaces
export const countrySpecificFormatters: CountryFormatRules = {
    AT: {
        postalCode: createFormatByDigits(4)
    },
    AU: {
        postalCode: createFormatByDigits(4)
    },
    BE: {
        postalCode: createFormatByDigits(4)
    },
    BG: {
        postalCode: createFormatByDigits(4)
    },
    BR: {
        postalCode: createFormatByDigits(8)
    },
    CA: {
        postalCode: {
            format: 'A9A 9A9 or A9A9A9',
            maxlength: 7
        }
    },
    CH: {
        postalCode: createFormatByDigits(4)
    },
    CY: {
        postalCode: createFormatByDigits(4)
    },
    CZ: {
        postalCode: {
            format: '999 99',
            maxlength: 6
        }
    },
    DE: {
        postalCode: createFormatByDigits(5)
    },
    DK: {
        postalCode: {
            format: '9999',
            maxlength: 7
        }
    },
    EE: {
        postalCode: createFormatByDigits(5)
    },
    ES: {
        postalCode: createFormatByDigits(5)
    },
    FI: {
        postalCode: createFormatByDigits(5)
    },
    FR: {
        postalCode: createFormatByDigits(5)
    },
    GB: {
        postalCode: {
            // Disallow special chars & set to maxlength
            formatterFn: val => val.replace(getFormattingRegEx(SPECIAL_CHARS), '').substr(0, 8),
            format: 'AA99 9AA or A99 9AA or A9 9AA',
            maxlength: 8
        }
    },
    GR: {
        postalCode: {
            format: '999 99',
            maxlength: 6
        }
    },
    HR: {
        postalCode: {
            format: '[1-5]9999',
            maxlength: 5
        }
    },
    HU: {
        postalCode: createFormatByDigits(4)
    },
    IE: {
        postalCode: {
            format: 'A99 A999',
            maxlength: 8
        }
    },
    IS: {
        postalCode: createFormatByDigits(3)
    },
    IT: {
        postalCode: createFormatByDigits(5)
    },
    LI: {
        postalCode: createFormatByDigits(4)
    },
    LT: {
        postalCode: {
            format: '9999 or 99999 or LT-99999',
            maxlength: 8
        }
    },
    LU: {
        postalCode: createFormatByDigits(4)
    },
    LV: {
        postalCode: {
            format: '9999 or LV-9999',
            maxlength: 7
        }
    },
    MC: {
        postalCode: {
            format: '980NN',
            maxlength: 5
        }
    },
    MT: {
        postalCode: {
            format: 'AA99 or AAA99 or AA9999 or AAA9999',
            maxlength: 8
        }
    },
    MY: {
        postalCode: createFormatByDigits(5)
    },
    NL: {
        postalCode: {
            format: '9999AA',
            maxlength: 7
        }
    },
    NZ: {
        postalCode: createFormatByDigits(4)
    },
    NO: {
        postalCode: createFormatByDigits(4)
    },
    PL: {
        postalCode: {
            // Formatter - excludes non digits & hyphens and limits to a maxlength that varies depending on whether a hyphen is present or not
            formatterFn: val => {
                const nuVal = val.replace(getFormattingRegEx('^\\d-', 'g'), '');
                const maxlength = nuVal.indexOf('-') > -1 ? 6 : 5;
                return nuVal.substr(0, maxlength);
            },
            format: '99999 or 99-999',
            maxlength: 6
        }
    },
    PT: {
        postalCode: {
            formatterFn: val => {
                const nuVal = val.replace(getFormattingRegEx('^\\d-', 'g'), '');
                return nuVal.substr(0, 8);
            },
            format: '9999-999',
            maxlength: 8
        }
    },
    RO: {
        postalCode: createFormatByDigits(6)
    },
    SI: {
        postalCode: {
            format: '9999 or SI-9999',
            maxlength: 7
        }
    },
    SE: {
        postalCode: createFormatByDigits(5)
    },
    SG: {
        postalCode: createFormatByDigits(6)
    },
    SK: {
        postalCode: {
            format: '99999 or SK-99999',
            maxlength: 8
        }
    },
    JP: {
        postalCode: {
            format: '999-9999',
            maxlength: 8
        }
    },
    US: {
        postalCode: {
            formatterFn: val => {
                const nuVal = val.replace(getFormattingRegEx('^\\d-', 'g'), '');
                const maxlength = nuVal.indexOf('-') > -1 ? 10 : 5;
                return nuVal.substr(0, maxlength);
            },
            format: '99999 or 99999-9999'
        }
    }
};
