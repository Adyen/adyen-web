export const ERROR_MSG_CARD_TOO_OLD = 'Card too old';
export const ERROR_MSG_CARD_TOO_FAR_IN_FUTURE = 'Date too far in future';
export const ERROR_MSG_CARD_EXPIRES_TOO_SOON = 'Card expires too soon';
export const ERROR_MSG_INCOMPLETE_FIELD = 'incomplete field';
export const ERROR_MSG_LUHN_CHECK_FAILED = 'luhn check failed';
export const ERROR_MSG_UNSUPPORTED_CARD_ENTERED = 'Unsupported card entered';
export const ERROR_MSG_INVALID_FIELD = 'field not valid';
export const ERROR_MSG_CLEARED = 'error was cleared';
export const ERROR_MSG_MBWAY_EMAIL_INVALID = 'Not valid email address';

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
    [ERROR_MSG_CARD_TOO_OLD]: 'error.va.sf-cc-dat.01',
    [ERROR_MSG_CARD_TOO_FAR_IN_FUTURE]: 'error.va.sf-cc-dat.02',
    [ERROR_MSG_CARD_EXPIRES_TOO_SOON]: 'error.va.sf-cc-dat.03',
    [ERROR_MSG_UNSUPPORTED_CARD_ENTERED]: 'error.va.sf-cc-num.03' // Triggered in Components
};

export const DEFAULT_ERROR = ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD];
