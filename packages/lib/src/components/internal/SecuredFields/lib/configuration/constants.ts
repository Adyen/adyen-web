import { CVCPolicyType, DatePolicyType } from '../types';

export const ENCRYPTED_CARD_NUMBER = 'encryptedCardNumber';
export const ENCRYPTED_EXPIRY_DATE = 'encryptedExpiryDate';
export const ENCRYPTED_EXPIRY_MONTH = 'encryptedExpiryMonth';
export const ENCRYPTED_EXPIRY_YEAR = 'encryptedExpiryYear';
export const ENCRYPTED_SECURITY_CODE = 'encryptedSecurityCode';
export const ENCRYPTED_PWD_FIELD = 'encryptedPassword';
export const ENCRYPTED_PIN_FIELD = 'encryptedPin';
export const ENCRYPTED_BANK_ACCNT_NUMBER_FIELD = 'encryptedBankAccountNumber';
export const ENCRYPTED_BANK_LOCATION_FIELD = 'encryptedBankLocationId';

export const ENCRYPTED_SECURITY_CODE_3_DIGITS = 'encryptedSecurityCode3digits';
export const ENCRYPTED_SECURITY_CODE_4_DIGITS = 'encryptedSecurityCode4digits';

export const GIFT_CARD = 'giftcard';

export const SF_VERSION = '4.4.1';

export const DEFAULT_CARD_GROUP_TYPES = ['amex', 'mc', 'visa'];

// export const NON_CREDIT_CARD_TYPE_SECURED_FIELDS = ['ach', GIFT_CARD, 'sepa', 'sepadirectdebit']; //Maybe, sometime in the future
export const NON_CREDIT_CARD_TYPE_SECURED_FIELDS = ['ach', GIFT_CARD];

// Credit card (CardInput) related securedFields
export const CREDIT_CARD_SF_FIELDS = [
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_PWD_FIELD
    // ENCRYPTED_PIN_FIELD,// probably redundant - it was an alt. name for KCP's encryptedPassword. But maybe has a role to play if we ever encrypt ibans.
];

export const OTHER_SF_FIELDS = [ENCRYPTED_BANK_ACCNT_NUMBER_FIELD, ENCRYPTED_BANK_LOCATION_FIELD]; // ACH fields

export const ALL_SECURED_FIELDS = CREDIT_CARD_SF_FIELDS.concat(OTHER_SF_FIELDS);

// export const ALL_RELATED_SECURED_FIELDS = ALL_SECURED_FIELDS.concat(NON_CREDIT_CARD_TYPE_SECURED_FIELDS);

// Card components created as: checkout.create({BRAND}) e.g. checkout.create('bcmc')
// - which are dedicated to a single, core, brand e.g. 'bcmc' BUT which can in effect handle multiple brands e.g. "bcmc", "maestro", "visa"
export const DEDICATED_CARD_COMPONENTS = ['bcmc'];

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

export const BRAND_ICON_UI_EXCLUSION_LIST = ['accel', 'pulse', 'star', 'nyce'];
