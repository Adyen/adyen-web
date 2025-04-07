import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_SECURITY_CODE
} from '../../components/internal/SecuredFields/lib/constants';

export const ARIA_ERROR_SUFFIX = '-ariaError';
export const ARIA_CONTEXT_SUFFIX = '-ariaContext';

export const ERROR_ACTION_FOCUS_FIELD = 'focusField';
export const ERROR_ACTION_BLUR_SCENARIO = 'notValidating:blurScenario';
export const ERROR_FIELD_REQUIRED = 'field.error.required';
export const ERROR_FIELD_INVALID = 'field.error.invalid';

export const ERROR_INVALID_FORMAT_EXPECTS = 'invalid.format.expects';
export const CREDITCARD_HOLDER_NAME_INVALID = 'creditCard.holderName.invalid';
export const CREDITCARD_TAX_NUMBER_INVALID = 'creditCard.taxNumber.invalid';
export const BOLETO_SOCIAL_SECURITY_NUMBER_INVALID = 'boleto.socialSecurityNumber.invalid';

export enum ErrorCodePrefixes {
    CC_NUM = 'cc.num',
    CC_DAT = 'cc.dat',
    CC_MTH = 'cc.mth',
    CC_YR = 'cc.yr',
    CC_CVC = 'cc.cvc',
    KCP_PWD = 'kcp.pwd'
}

/**
 * For SecuredFields
 * Human readable error strings mapped to the codes, used as keys, in the translations files
 */
export enum SF_ErrorCodes {
    ERROR_MSG_INCOMPLETE_FIELD = 'err.gen.9100',
    ERROR_MSG_INVALID_FIELD = 'err.gen.9101',

    ERROR_MSG_LUHN_CHECK_FAILED = `${ErrorCodePrefixes.CC_NUM}.902`,
    ERROR_MSG_EMPTY_PAN = `${ErrorCodePrefixes.CC_NUM}.900`,
    ERROR_MSG_UNSUPPORTED_CARD_ENTERED = `${ErrorCodePrefixes.CC_NUM}.903`,
    ERROR_MSG_INCORRECTLY_FILLED_PAN = `${ErrorCodePrefixes.CC_NUM}.901`, // 'Enter the complete card number'

    ERROR_MSG_CARD_TOO_OLD = `${ErrorCodePrefixes.CC_DAT}.912`,
    ERROR_MSG_CARD_TOO_FAR_IN_FUTURE = `${ErrorCodePrefixes.CC_DAT}.913`,
    ERROR_MSG_CARD_EXPIRES_TOO_SOON = `${ErrorCodePrefixes.CC_DAT}.914`,
    ERROR_MSG_EMPTY_DATE = `${ErrorCodePrefixes.CC_DAT}.910`,
    ERROR_MSG_INCORRECTLY_FILLED__DATE = `${ErrorCodePrefixes.CC_DAT}.911`,

    ERROR_MSG_EMPTY_YEAR = `${ErrorCodePrefixes.CC_YR}.917`,
    ERROR_MSG_INCORRECTLY_FILLED_YEAR = `${ErrorCodePrefixes.CC_YR}.918`,

    // ERROR_MSG_INCORRECTLY_FILLED_MONTH= `cc.mth.916`,
    ERROR_MSG_EMPTY_MONTH = `${ErrorCodePrefixes.CC_MTH}.915`,

    ERROR_MSG_EMPTY_CVC = `${ErrorCodePrefixes.CC_CVC}.920`,
    ERROR_MSG_INCORRECTLY_FILLED_CVC = `${ErrorCodePrefixes.CC_CVC}.921`,

    ERROR_MSG_EMPTY_KCP_PWD = `${ErrorCodePrefixes.KCP_PWD}.940`,
    ERROR_MSG_INCORRECTLY_FILLED_KCP_PWD = `${ErrorCodePrefixes.KCP_PWD}.941`
}

export const EMPTY_FIELD_ERROR_MESSAGES = {
    [ENCRYPTED_CARD_NUMBER]: SF_ErrorCodes.ERROR_MSG_EMPTY_PAN,
    [ENCRYPTED_EXPIRY_DATE]: SF_ErrorCodes.ERROR_MSG_EMPTY_DATE,
    [ENCRYPTED_EXPIRY_MONTH]: SF_ErrorCodes.ERROR_MSG_EMPTY_MONTH,
    [ENCRYPTED_EXPIRY_YEAR]: SF_ErrorCodes.ERROR_MSG_EMPTY_YEAR,
    [ENCRYPTED_SECURITY_CODE]: SF_ErrorCodes.ERROR_MSG_EMPTY_CVC,
    [ENCRYPTED_PWD_FIELD]: SF_ErrorCodes.ERROR_MSG_EMPTY_KCP_PWD
};
