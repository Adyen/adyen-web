export const BIN_LOOKUP_VERSION = 'v3';

export const REGULAR_TEST_CARD = '5500000000000004';
export const AMEX_CARD = '370000000000002';

export const MAESTRO_CARD = '5000550000000029';

export const SYNCHRONY_PLCC_NO_LUHN = '6044100018023838'; // also, no date
export const SYNCHRONY_PLCC_WITH_LUHN = '6044141000018769'; // also, no date
export const SYNCHRONY_PLCC_NO_DATE = SYNCHRONY_PLCC_NO_LUHN; // no date

export const TEST_DATE_VALUE = '03/30';
export const TEST_CVC_VALUE = '737';

export const BIN_LOOKUP_URL = `https://checkoutshopper-test.adyen.com/checkoutshopper/${BIN_LOOKUP_VERSION}/bin/binLookup?token=${process.env.CLIENT_KEY}`;

export const USER_TYPE_DELAY = 150;
export const KEYBOARD_DELAY = 300;

export const SESSION_DATA_MOCK = 'AAAADEMOSESSIONDATAAAA';

export const ORDER_DATA_MOCK = 'BBBBORDERDATABBBB';

export const SESSION_RESULT_MOCK = 'CCCCSESIONRESULTCCCC';

export const ENCRYPTED_CARD_NUMBER = 'encryptedCardNumber';
export const ENCRYPTED_EXPIRY_DATE = 'encryptedExpiryDate';
export const ENCRYPTED_EXPIRY_MONTH = 'encryptedExpiryMonth';
export const ENCRYPTED_EXPIRY_YEAR = 'encryptedExpiryYear';
export const ENCRYPTED_SECURITY_CODE = 'encryptedSecurityCode';
