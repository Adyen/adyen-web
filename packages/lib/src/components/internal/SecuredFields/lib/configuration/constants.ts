export const ENCRYPTED_CARD_NUMBER = 'encryptedCardNumber';
export const ENCRYPTED_EXPIRY_DATE = 'encryptedExpiryDate';
export const ENCRYPTED_EXPIRY_MONTH = 'encryptedExpiryMonth';
export const ENCRYPTED_EXPIRY_YEAR = 'encryptedExpiryYear';
export const ENCRYPTED_SECURITY_CODE = 'encryptedSecurityCode';
export const ENCRYPTED_SECURITY_CODE_3_DIGITS = 'encryptedSecurityCode3digits';
export const ENCRYPTED_SECURITY_CODE_4_DIGITS = 'encryptedSecurityCode4digits';

export const ENCRYPTED_PWD_FIELD = 'encryptedPassword';
export const ENCRYPTED_PIN_FIELD = 'encryptedPin';

export const GIFT_CARD = 'giftcard';

export const ENCRYPTED_BANK_ACCNT_NUMBER_FIELD = 'encryptedBankAccountNumber';
export const ENCRYPTED_BANK_LOCATION_FIELD = 'encryptedBankLocationId';

export const SF_VERSION = '3.5.1';

export const DEFAULT_CARD_GROUP_TYPES = ['amex', 'mc', 'visa'];

export const NON_CREDIT_CARD_TYPE_SECURED_FIELDS = ['sepa', 'sepadirectdebit', 'ach', GIFT_CARD];

export const CSF_FIELDS_ARRAY = [
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE
];

export const CVC_POLICY_REQUIRED = 'required';
export const CVC_POLICY_OPTIONAL = 'optional';
export const CVC_POLICY_HIDDEN = 'hidden';

export const DATE_POLICY_REQUIRED = CVC_POLICY_REQUIRED;
export const DATE_POLICY_HIDDEN = CVC_POLICY_HIDDEN;
