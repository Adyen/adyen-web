import { ValidateFunction, ValidatorMode, ValidatorRule, ValidatorRules } from '../../../../utils/Validator/types';
import { formatCPFCNPJ } from '../../../internal/SocialSecurityNumberBrazil/utils';
import validateSSN from '../../../internal/SocialSecurityNumberBrazil/validate';
import { isEmpty } from '../../../../utils/validator-utils';
import {
    BOLETO_SOCIAL_SECURITY_NUMBER_INVALID,
    CREDITCARD_HOLDER_NAME_INVALID,
    CREDITCARD_TAX_NUMBER_INVALID
} from '../../../../core/Errors/constants';

export const cardInputFormatters = {
    socialSecurityNumber: formatCPFCNPJ
};

export const cardInputValidationRules = {
    socialSecurityNumber: [
        {
            modes: ['blur'],
            validate: value => {
                if (isEmpty(value)) return null;
                return validateSSN(value);
            },
            errorMessage: BOLETO_SOCIAL_SECURITY_NUMBER_INVALID
        }
    ],
    taxNumber: [
        {
            modes: ['blur'],
            validate: value => (isEmpty(value) ? null : value?.length === 6 || value?.length === 10),
            errorMessage: CREDITCARD_TAX_NUMBER_INVALID
        }
    ],
    holderName: [
        {
            // Will fire at startup and when triggerValidation is called and also applies as text is input
            modes: ['blur'],
            validate: value => (isEmpty(value) ? null : true), // true, if there are chars other than spaces
            errorMessage: CREDITCARD_HOLDER_NAME_INVALID
        }
    ],
    default: [
        {
            modes: ['blur'],
            // ensuring we don't try to run this against objects e.g. billingAddress
            validate: value => !!value && typeof value === 'string' && value.trim().length > 0
        }
    ]
} as const satisfies ValidatorRules;

export const getRuleByNameAndMode = (name: keyof typeof cardInputValidationRules, mode: ValidatorMode): ValidateFunction => {
    const ruleOrRules = cardInputValidationRules[name];
    const ruleArr = (Array.isArray(ruleOrRules) ? ruleOrRules : [ruleOrRules]) as ValidatorRule[];
    const rule = ruleArr.reduce((acc, elem) => {
        if (!acc.length) {
            if (elem.modes.includes(mode)) {
                acc.push(elem.validate);
            }
        }
        return acc;
    }, [] as ValidateFunction[]);
    return rule[0];
};
