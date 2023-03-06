export const BIN_LOOKUP_VERSION = 'v3';

export const KOREAN_TEST_CARD = '9490220006611406'; // 9490220006611406 works against Test. For localhost:8080 use: 5067589608564358 + hack in triggerBinLookup
export const REGULAR_TEST_CARD = '5500000000000004';
export const DUAL_BRANDED_CARD = '4035501000000008'; // dual branded visa & cartebancaire
export const MAESTRO_CARD = '5000550000000029';
export const BCMC_CARD = '6703444444444449'; // actually dual branded bcmc & maestro
export const BCMC_DUAL_BRANDED_VISA = '4871049999999910'; // dual branded visa & bcmc
export const UNKNOWN_BIN_CARD = '135410014004955'; // card that is not in the test DBs (uatp)
export const UNKNOWN_VISA_CARD = '4111111111111111'; // card that is not in the test DBs (visa)
export const AMEX_CARD = '370000000000002';

export const DUAL_BRANDED_CARD_EXCLUDED = '4001230000000004'; // dual branded visa/star

export const SYNCHRONY_PLCC_NO_LUHN = '6044100018023838'; // also, no date
export const SYNCHRONY_PLCC_WITH_LUHN = '6044141000018769'; // also, no date

export const FAILS_LUHN_CARD = '4111111111111112';

export const THREEDS2_FRICTIONLESS_CARD = '5201281505129736';
export const THREEDS2_FULL_FLOW_CARD = '5000550000000029';
export const THREEDS2_CHALLENGE_ONLY_CARD = '4212345678910006';

export const MULTI_LUHN_MAESTRO = '6771830999991239343'; // maestro that passes luhn check at 16, 18 & 19 digits

export const TEST_DATE_VALUE = '03/30';
export const TEST_MONTH_VALUE = '03';
export const TEST_YEAR_VALUE = '30';
export const TEST_CVC_VALUE = '737';
export const TEST_PWD_VALUE = '12';
export const TEST_TAX_NUMBER_VALUE = '123456';
export const TEST_CPF_VALUE = '22936094488';

export const JWE_VERSION = '1';
export const JWE_CONTENT_ALG = 'A256CBC-HS512';
export const JWE_ALG = 'RSA-OAEP';
