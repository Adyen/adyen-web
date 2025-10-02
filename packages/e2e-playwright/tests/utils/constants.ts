export const BIN_LOOKUP_VERSION = 'v3';

export const REGULAR_TEST_CARD = '5500000000000004';
export const MASTER_CARD = '5555 5555 5555 4444';
export const VISA_CARD = '4111111111111111';
export const AMEX_CARD = '370000000000002';
export const KOREAN_TEST_CARD = '9490220006611406'; // 9490220006611406 works against Test. For localhost:8080 use: 5067589608564358 + hack in triggerBinLookup
export const BCMC_CARD = '6703444444444449'; // actually dual branded bcmc & maestro
export const DUAL_BRANDED_CARD = '4035501000000008'; // dual branded visa & cartebancaire
export const BCMC_DUAL_BRANDED_VISA = '4871049999999910'; // dual branded visa & bcmc
export const BCMC_DUAL_BRANDED_MC = '5127880999999990'; // dual branded mc & bcmc
export const DUAL_BRANDED_CARD_EXCLUDED = '4001230000000004'; // dual branded visa/star
export const CARD_WITH_PAN_LENGTH = '4000620000000007';

export const DUAL_BRANDED_EFTPOS = '4687380100010006';

export const THREEDS2_FRICTIONLESS_CARD = '5201281505129736';
export const THREEDS2_FULL_FLOW_CARD = '5000550000000029';
export const THREEDS2_CHALLENGE_ONLY_CARD = '4212345678910006';
export const THREEDS2_CHALLENGE_PASSWORD = 'password';
export const MULTI_LUHN_MAESTRO = '6771830999991239343'; // maestro that passes luhn check at 16, 18 & 19 digits
export const THREEDS2_MAESTRO_CARD = '5000550000000029';

export const UNKNOWN_BIN_CARD = '135410014004955'; // card that is not in the test DBs (uatp)
export const UNKNOWN_BIN_CARD_REGEX_VISA = '4354100140049554'; // card that is not in the test DBs but which our regEx will recognise as Visa
export const UNKNOWN_VISA_CARD = '41111111'; // card is now in the test DBs (visa) - so keep it short to stop it firing binLookup

export const PLCC_NO_LUHN_OPTIONAL_DATE = '6044100018023838'; // binLookup gives luhn check and date not required
export const PLCC_WITH_LUHN_NO_DATE = '6044141000018769'; // binLookup gives luhn check required but date not required
export const PLCC_WITH_LUHN_OPTIONAL_DATE_WOULD_FAIL_LUHN = '6044141000018768'; // binLookup gives luhn check required, date not required, BUT that will fail the luhn check
export const PLCC_NO_LUHN_OPTIONAL_DATE_WOULD_FAIL_LUHN = '6044100033327222'; // A PAN that identifies as a plcc that doesn't require a luhn check BUT that would fail the luhn check if it was required

// intersolve (plastix)
export const GIFTCARD_NUMBER = '4010100000000000000';
export const GIFTCARD_PIN = '73737';

export const INVALID_TEST_DATE_VALUE = '0390';
export const TEST_DATE_VALUE = '03/30';
export const TEST_CVC_VALUE = '737';
export const TEST_POSTCODE = '1234';

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

export const TEST_MONTH_VALUE = '03';
export const TEST_YEAR_VALUE = '30';
export const TEST_PWD_VALUE = '12';
export const TEST_TAX_NUMBER_VALUE = '123456';
export const TEST_CPF_VALUE = '22936094488';

export const JWE_VERSION = '1';
export const JWE_CONTENT_ALG = 'A256CBC-HS512';
export const JWE_ALG = 'RSA-OAEP';

export const PAYMENT_RESULT = {
    authorised: 'Authorised',
    refused: 'Refused',
    detailsSaved: 'Details saved',
    success: 'Payment Successful',
    fail: 'An unknown error occurred'
};
