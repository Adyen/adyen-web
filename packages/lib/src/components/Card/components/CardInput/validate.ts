import { ValidatorRules } from '../../../../utils/Validator/Validator';
import { formatCPFCNPJ } from '../../../Boleto/components/SocialSecurityNumberBrazil/utils';
import validateSSN from '../../../Boleto/components/SocialSecurityNumberBrazil/validate';

export const validateHolderName = (holderName: string, holderNameRequired = false, emptyIsError = true): boolean => {
    // if (holderNameRequired) {
    //     return !!holderName && typeof holderName === 'string' && holderName.trim().length > 0;
    // }
    //
    // return true;

    if (!holderNameRequired) {
        return true;
    }

    // Holder name is required...
    const len = holderName.trim().length;
    if (len === 0 && !emptyIsError) {
        return true;
    }

    return len > 0;
};
export default {
    validateHolderName
};

const nonLetterRegEx = /[^A-Z\s]/gi; // detect anything that's not a letter or spaces

export const cardInputFormatters = {
    holderName: value => value.replace(nonLetterRegEx, ''),
    socialSecurityNumber: formatCPFCNPJ
};

export const cardInputValidationRules: ValidatorRules = {
    socialSecurityNumber: [
        {
            modes: ['blur'],
            validate: validateSSN
        }
    ],
    taxNumber: [
        {
            modes: ['blur'],
            validate: value => value?.length === 6 || value?.length === 10
        }
    ],
    holderName: [
        {
            // Will fire at startup and when triggerValidation is called and also applies as text is input
            modes: ['blur'],
            validate: value => value.trim().length > 0 // i.e. are there chars other than spaces?
        }
    ],
    default: [
        {
            modes: ['blur'],
            // ensuring we don't try to run this against objects e.g. billingAddress
            validate: value => !!value && typeof value === 'string' && value.trim().length > 0
        }
    ]
};

export const getRuleByNameAndMode = (name, mode) => {
    const ruleArr = cardInputValidationRules[name] as any[];
    const rule = ruleArr.reduce((acc, elem) => {
        if (!acc.length) {
            if (elem.modes.includes(mode)) {
                acc.push(elem.validate);
            }
        }
        return acc;
    }, []);
    return rule[0];
};
