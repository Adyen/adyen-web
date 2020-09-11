export const VALIDATION_ERROR = 'error.va';
export const CONFIGURATION_ERROR = 'error.co';
export const DEV_ERROR = 'error.de';
export const APP_ERROR = 'error.ap';

/**
 * start: Errors list
 */
// Validation errors
export const ERROR_MSG_CARD_TOO_OLD = 'Card too old';
export const ERROR_MSG_CARD_TOO_FAR_IN_FUTURE = 'Date too far in future';
export const ERROR_MSG_CARD_NUMBER_MISMATCH = "Typed card number doesn't match card brand";
export const ERROR_MSG_INCOMPLETE_FIELD = 'incomplete field';
export const ERROR_MSG_LUHN_CHECK_FAILED = 'luhn check failed';
export const ERROR_MSG_UNSUPPORTED_CARD_ENTERED = 'Unsupported card entered';
export const ERROR_MSG_INVALID_FIELD = 'field not valid';

// Configuration errors
export const ERROR_MSG_NO_KEYS = 'No client or origin keys set';
export const ERROR_MSG_NO_ROOT_NODE = 'Component could not mount';
export const ERROR_MSG_COMP_ALREADY_MOUNTED = 'Component is already mounted';
export const ERROR_MSG_COMP_NOT_MOUNTED = 'Component is not mounted, so cannot be remounted';
export const ERROR_MSG_INVALID_PM_NAME = 'not a valid Checkout Component';
export const ERROR_MSG_INVALID_COMP = 'No Payment Method component was passed';
export const ERROR_MSG_INCORRECT_PMR = 'paymentMethodsResponse was provided but of an incorrect type';

// Developer errors
export const ERROR_MSG_NO_RENDER_METHOD = 'No render method';

// Application errors
export const ERROR_MSG_INVALID_ACTION = 'Invalid action';
export const ERROR_MSG_NO_ACTION = 'No action exists';
/**
 * end: Errors list
 */

/**
 * Error Codes
 * @example error.va.sf-cc-num.01
 * =
 * error
 * .validation error
 * .field description (securedFields-creditCard-number)
 * .error type (luhn check failed)]
 */
export const ERROR_CODES = {
    [ERROR_MSG_INCOMPLETE_FIELD]: `${VALIDATION_ERROR}.gen.01`,
    [ERROR_MSG_INVALID_FIELD]: `${VALIDATION_ERROR}.gen.02`,
    [ERROR_MSG_LUHN_CHECK_FAILED]: `${VALIDATION_ERROR}.sf-cc-num.01`,
    [ERROR_MSG_CARD_NUMBER_MISMATCH]: `${VALIDATION_ERROR}.sf-cc-num.02`,
    [ERROR_MSG_CARD_TOO_OLD]: `${VALIDATION_ERROR}.sf-cc-dat.01`,
    [ERROR_MSG_CARD_TOO_FAR_IN_FUTURE]: `${VALIDATION_ERROR}.sf-cc-dat.02`,
    [ERROR_MSG_UNSUPPORTED_CARD_ENTERED]: `${VALIDATION_ERROR}.sf-cc-num.03`,

    [ERROR_MSG_NO_KEYS]: `${CONFIGURATION_ERROR}.key.01`,
    [ERROR_MSG_NO_ROOT_NODE]: `${CONFIGURATION_ERROR}.mount.01`,
    [ERROR_MSG_COMP_ALREADY_MOUNTED]: `${CONFIGURATION_ERROR}.mount.02`,
    [ERROR_MSG_COMP_NOT_MOUNTED]: `${CONFIGURATION_ERROR}.mount.03`,
    [ERROR_MSG_INVALID_PM_NAME]: `${CONFIGURATION_ERROR}.create.01`,
    [ERROR_MSG_INVALID_COMP]: `${CONFIGURATION_ERROR}.create.02`,
    [ERROR_MSG_INCORRECT_PMR]: `${CONFIGURATION_ERROR}.pmr.01`,

    [ERROR_MSG_NO_RENDER_METHOD]: `${DEV_ERROR}.render.01`,

    [ERROR_MSG_INVALID_ACTION]: `${APP_ERROR}.act.01`,
    [ERROR_MSG_NO_ACTION]: `${APP_ERROR}.act.02`
};

export const DEFAULT_ERROR = ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD];

export const ERROR_MSG_CLEARED = 'error was cleared';
