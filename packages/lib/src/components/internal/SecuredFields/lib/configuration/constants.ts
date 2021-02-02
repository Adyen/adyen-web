export const ENCRYPTED_CARD_NUMBER = 'encryptedCardNumber';
export const ENCRYPTED_EXPIRY_DATE = 'encryptedExpiryDate';
export const ENCRYPTED_EXPIRY_MONTH = 'encryptedExpiryMonth';
export const ENCRYPTED_EXPIRY_YEAR = 'encryptedExpiryYear';
export const ENCRYPTED_SECURITY_CODE = 'encryptedSecurityCode';

export const ENCRYPTED_PWD_FIELD = 'encryptedPassword';
export const ENCRYPTED_PIN_FIELD = 'encryptedPin';

export const ENCRYPTED_BANK_ACCNT_NUMBER_FIELD = 'encryptedBankAccountNumber';
export const ENCRYPTED_BANK_LOCATION_FIELD = 'encryptedBankLocationId';

export const SF_VERSION = '3.3.0';

export const DEFAULT_CARD_GROUP_TYPES = ['amex', 'mc', 'visa'];

export const NON_CREDIT_CARD_TYPE_SECURED_FIELDS = ['sepa', 'sepadirectdebit', 'ach', 'giftcard'];

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
