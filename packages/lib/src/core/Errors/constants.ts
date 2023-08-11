import {
    ENCRYPTED_BANK_ACCNT_NUMBER_FIELD,
    ENCRYPTED_BANK_LOCATION_FIELD,
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_SECURITY_CODE
} from '../../components/internal/SecuredFields/lib/configuration/constants';

export const ARIA_ERROR_SUFFIX = '-ariaError';
export const ARIA_CONTEXT_SUFFIX = '-ariaContext';

export const ERROR_MSG_CARD_TOO_OLD = 'Card too old';
export const ERROR_MSG_CARD_TOO_FAR_IN_FUTURE = 'Date too far in future';
export const ERROR_MSG_CARD_EXPIRES_TOO_SOON = 'Your card expires before check out date';
export const ERROR_MSG_INCOMPLETE_FIELD = 'incomplete field';
export const ERROR_MSG_LUHN_CHECK_FAILED = 'luhn check failed';
export const ERROR_MSG_UNSUPPORTED_CARD_ENTERED = 'Unsupported card entered';
export const ERROR_MSG_INVALID_FIELD = 'field not valid';
export const ERROR_MSG_CLEARED = 'error was cleared';
export const ERROR_MSG_MBWAY_EMAIL_INVALID = 'Not valid email address';
// export const ERROR_MSG_KCP_INVALID_PWD = 'invalid password';

// NEW
export const ERROR_MSG_EMPTY_PAN = 'Card number field empty';
export const ERROR_MSG_EMPTY_DATE = 'Expiry date field empty';
export const ERROR_MSG_EMPTY_YEAR = 'Expiry year field empty';
export const ERROR_MSG_EMPTY_MONTH = 'Expiry month field empty';
export const ERROR_MSG_EMPTY_CVC = 'Security code field empty';
export const ERROR_MSG_EMPTY_KCP_PWD = 'KCP password field empty';
export const ERROR_MSG_EMPTY_ACH_ACCOUNT_NUMBER = 'ACH bank account field empty';
export const ERROR_MSG_EMPTY_ACH_BANK_LOCATION_ID = 'ACH bank location field empty';

export const ERROR_MSG_INCORRECTLY_FILLED_PAN = 'Card number not filled correctly';
export const ERROR_MSG_INCORRECTLY_FILLED__DATE = 'Expiry date not filled correctly';
// export const ERROR_MSG_INCORRECTLY_FILLED_MONTH = 'Expiry month not filled correctly';
export const ERROR_MSG_INCORRECTLY_FILLED_YEAR = 'Expiry year not filled correctly';
export const ERROR_MSG_INCORRECTLY_FILLED_CVC = 'Security code not filled correctly';
export const ERROR_MSG_INCORRECTLY_FILLED_KCP_PWD = 'KCP password not filled correctly';
export const ERROR_MSG_INCORRECTLY_FILLED_ACH_ACCOUNT_NUMBER = 'ACH bank account not filled correctly';
export const ERROR_MSG_INCORRECTLY_FILLED_ACH_BANK_LOCATION_ID = 'ACH bank location id not filled correctly';
// end NEW

/**
 * Error Codes
 * @example error.va.sf-cc-num.01
 * =
 * error
 * .validation error
 * .field description
 * .error type (luhn check failed)]
 */
export const ERROR_CODES = {
    [ERROR_MSG_INCOMPLETE_FIELD]: 'error.va.gen.01',
    [ERROR_MSG_INVALID_FIELD]: 'error.va.gen.02',

    [ERROR_MSG_LUHN_CHECK_FAILED]: 'error.va.sf-cc-num.01',
    [ERROR_MSG_EMPTY_PAN]: 'error.va.sf-cc-num.02', // All "empty field" errors are triggered in Components
    [ERROR_MSG_UNSUPPORTED_CARD_ENTERED]: 'error.va.sf-cc-num.03', // Triggered in Components
    [ERROR_MSG_INCORRECTLY_FILLED_PAN]: 'error.va.sf-cc-num.04',

    [ERROR_MSG_CARD_TOO_OLD]: 'error.va.sf-cc-dat.01',
    [ERROR_MSG_CARD_TOO_FAR_IN_FUTURE]: 'error.va.sf-cc-dat.02',
    [ERROR_MSG_CARD_EXPIRES_TOO_SOON]: 'error.va.sf-cc-dat.03',
    [ERROR_MSG_EMPTY_DATE]: 'error.va.sf-cc-dat.04',
    [ERROR_MSG_INCORRECTLY_FILLED__DATE]: 'error.va.sf-cc-dat.05',

    [ERROR_MSG_EMPTY_YEAR]: 'error.va.sf-cc-yr.01',
    [ERROR_MSG_INCORRECTLY_FILLED_YEAR]: 'error.va.sf-cc-yr.02',

    // [ERROR_MSG_INCORRECTLY_FILLED_MONTH]: 'error.va.sf-cc-mth.02',
    [ERROR_MSG_EMPTY_MONTH]: 'error.va.sf-cc-mth.01',

    [ERROR_MSG_EMPTY_CVC]: 'error.va.sf-cc-cvc.01',
    [ERROR_MSG_INCORRECTLY_FILLED_CVC]: 'error.va.sf-cc-cvc.02',

    [ERROR_MSG_EMPTY_KCP_PWD]: 'error.va.sf-kcp-pwd.01',
    [ERROR_MSG_INCORRECTLY_FILLED_KCP_PWD]: 'error.va.sf-kcp-pwd.02',

    [ERROR_MSG_EMPTY_ACH_ACCOUNT_NUMBER]: 'error.va.sf-ach-num.01',
    [ERROR_MSG_INCORRECTLY_FILLED_ACH_ACCOUNT_NUMBER]: 'error.va.sf-ach-num.02',

    [ERROR_MSG_EMPTY_ACH_BANK_LOCATION_ID]: 'error.va.sf-ach-loc.01',
    [ERROR_MSG_INCORRECTLY_FILLED_ACH_BANK_LOCATION_ID]: 'error.va.sf-ach-loc.02'
};

export const DEFAULT_ERROR = ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD];

// All "empty field" errors are triggered in Components
export const EMPTY_FIELD_ERROR_MESSAGES = {
    [ENCRYPTED_CARD_NUMBER]: ERROR_CODES[ERROR_MSG_EMPTY_PAN],
    [ENCRYPTED_EXPIRY_DATE]: ERROR_CODES[ERROR_MSG_EMPTY_DATE],
    [ENCRYPTED_EXPIRY_MONTH]: ERROR_CODES[ERROR_MSG_EMPTY_MONTH],
    [ENCRYPTED_EXPIRY_YEAR]: ERROR_CODES[ERROR_MSG_EMPTY_YEAR],
    [ENCRYPTED_SECURITY_CODE]: ERROR_CODES[ERROR_MSG_EMPTY_CVC],
    [ENCRYPTED_PWD_FIELD]: ERROR_CODES[ERROR_MSG_EMPTY_KCP_PWD],
    [ENCRYPTED_BANK_ACCNT_NUMBER_FIELD]: ERROR_CODES[ERROR_MSG_EMPTY_ACH_ACCOUNT_NUMBER],
    [ENCRYPTED_BANK_LOCATION_FIELD]: ERROR_CODES[ERROR_MSG_EMPTY_ACH_BANK_LOCATION_ID]
};

export const ERROR_ACTION_FOCUS_FIELD = 'focusField';
export const ERROR_ACTION_BLUR_SCENARIO = 'notValidating:blurScenario';
