import { ValidatorRules } from '../../../../utils/Validator/types';
import { formatCPFCNPJ } from '../../../internal/SocialSecurityNumberBrazil/utils';
import validateSSN from '../../../internal/SocialSecurityNumberBrazil/validate';
import { isEmpty } from '../../../../utils/validator-utils';

export const cardInputFormatters = {
    socialSecurityNumber: formatCPFCNPJ
};

export const cardInputValidationRules: ValidatorRules = {
    socialSecurityNumber: [
        {
            modes: ['blur'],
            validate: value => {
                if (isEmpty(value)) return null;
                return validateSSN(value);
            },
            errorMessage: 'boleto.socialSecurityNumber.invalid'
        }
    ],
    taxNumber: [
        {
            modes: ['blur'],
            validate: value => (isEmpty(value) ? null : value?.length === 6 || value?.length === 10),
            errorMessage: 'creditCard.taxNumber.invalid'
        }
    ],
    holderName: [
        {
            // Will fire at startup and when triggerValidation is called and also applies as text is input
            modes: ['blur'],
            // validate: value => (isEmpty(value) ? null : true), // true, if there are chars other than spaces
            validate: value => (isEmpty(value) ? null : value.length > 1), // true, if there are chars other than spaces //TODO set back to above
            errorMessage: 'creditCard.holderName.invalid'
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
