export const ERROR_MSG_CARD_TOO_OLD = 'Card too old';
export const ERROR_MSG_CARD_TOO_FAR_IN_FUTURE = 'Date too far in future';
export const ERROR_MSG_CARD_NUMBER_MISMATCH = "Typed card number doesn't match card type";
export const ERROR_MSG_INCOMPLETE_FIELD = 'incomplete field';
export const ERROR_MSG_LUHN_CHECK_FAILED = 'luhn check failed';
export const ERROR_MSG_UNSUPPORTED_CARD_ENTERED = 'Unsupported card entered';

/**
 * Error Codes
 * @example error.ve.cc-num.02
 * =
 * error
 * .validation error
 * .field description
 * .error type (luhn check failed)]
 */
export const ERROR_CODES = {
    [ERROR_MSG_INCOMPLETE_FIELD]: 'error.ve.gen.01',
    [ERROR_MSG_LUHN_CHECK_FAILED]: 'error.ve.cc-num.02',
    [ERROR_MSG_CARD_NUMBER_MISMATCH]: 'error.ve.cc-num.03',
    [ERROR_MSG_CARD_TOO_OLD]: 'error.ve.cc-dat.04',
    [ERROR_MSG_CARD_TOO_FAR_IN_FUTURE]: 'error.ve.cc-dat.05',
    [ERROR_MSG_UNSUPPORTED_CARD_ENTERED]: 'error.ve.cc-num.06'
};

export const DEFAULT_ERROR = ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD];
