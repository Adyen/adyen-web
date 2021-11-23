import { CVCPolicyType, DatePolicyType } from '../core/AbstractSecuredField';

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

export const SF_VERSION = '3.7.4';

export const DEFAULT_CARD_GROUP_TYPES = ['amex', 'mc', 'visa'];

export const NON_CREDIT_CARD_TYPE_SECURED_FIELDS = ['sepa', 'sepadirectdebit', 'ach', GIFT_CARD];

export const SF_FIELDS_ARRAY = [
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_PIN_FIELD,
    ENCRYPTED_BANK_ACCNT_NUMBER_FIELD,
    ENCRYPTED_BANK_LOCATION_FIELD
];

export const ALL_SECURED_FIELDS = SF_FIELDS_ARRAY.concat(NON_CREDIT_CARD_TYPE_SECURED_FIELDS);

export const REQUIRED = 'required';
export const OPTIONAL = 'optional';
export const HIDDEN = 'hidden';

export const CVC_POLICY_REQUIRED: CVCPolicyType = REQUIRED;
export const CVC_POLICY_OPTIONAL: CVCPolicyType = OPTIONAL;
export const CVC_POLICY_HIDDEN: CVCPolicyType = HIDDEN;

export const DATE_POLICY_REQUIRED: DatePolicyType = REQUIRED;
export const DATE_POLICY_OPTIONAL: DatePolicyType = OPTIONAL;
export const DATE_POLICY_HIDDEN: DatePolicyType = HIDDEN;

export const DATA_ENCRYPTED_FIELD_ATTR = 'data-cse';
export const DATA_INFO = 'data-info';
export const DATA_UID = 'data-uid';
