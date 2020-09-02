export const ENCRYPTED_CARD_NUMBER = 'encryptedCardNumber';
export const ENCRYPTED_EXPIRY_DATE = 'encryptedExpiryDate';
export const ENCRYPTED_EXPIRY_MONTH = 'encryptedExpiryMonth';
export const ENCRYPTED_EXPIRY_YEAR = 'encryptedExpiryYear';
export const ENCRYPTED_SECURITY_CODE = 'encryptedSecurityCode';

export const ENCRYPTED_PWD_FIELD = 'encryptedPassword';
export const ENCRYPTED_PIN_FIELD = 'encryptedPin';

export const ENCRYPTED_BANK_ACCNT_NUMBER_FIELD = 'encryptedBankAccountNumber';
export const ENCRYPTED_BANK_LOCATION_FIELD = 'encryptedBankLocationId';

export const SF_VERSION = '3.2.6';

export const DEFAULT_CARD_GROUP_TYPES = ['amex', 'mc', 'visa'];

export const IFRAME_TITLE = 'Iframe for secured card data input field';

export const NON_CREDIT_CARD_TYPE_SECURED_FIELDS = ['sepa', 'sepadirectdebit', 'ach', 'giftcard'];

export const CSF_FIELDS_ARRAY = [
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE
];

export const ERROR_MSG_CARD_TOO_OLD = 'Card too old';
export const ERROR_MSG_CARD_TOO_FAR_IN_FUTURE = 'Date too far in future';
export const ERROR_MSG_CARD_NUMBER_MISMATCH = "Typed card number doesn't match card type";
export const ERROR_MSG_INCOMPLETE_FIELD = 'incomplete field';
export const ERROR_MSG_LUHN_CHECK_FAILED = 'luhn check failed';
export const ERROR_MSG_UNSUPPORTED_CARD_ENTERED = 'Unsupported card entered';

export const DEFAULT_ERROR = ERROR_MSG_INCOMPLETE_FIELD;

/**
 * @example
 * co:sf:ve:06 =
 * [Where the error is detected (components)]
 * :[What the error applies to (securedFields)]
 * :[what sort of error (validation error)]
 * :[error type (unsupported card entered)]
 */
export const ERROR_CODES = {
    [ERROR_MSG_INCOMPLETE_FIELD]: 'sf:sf:ve:01',
    [ERROR_MSG_LUHN_CHECK_FAILED]: 'sf:sf:ve:02',
    [ERROR_MSG_CARD_NUMBER_MISMATCH]: 'sf:sf:ve:03',
    [ERROR_MSG_CARD_TOO_OLD]: 'sf:sf:ve:04',
    [ERROR_MSG_CARD_TOO_FAR_IN_FUTURE]: 'sf:sf:ve:05',
    [ERROR_MSG_UNSUPPORTED_CARD_ENTERED]: 'co:sf:ve:06'
};
