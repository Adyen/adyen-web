export const ANALYTICS_PATH = 'v3/analytics';

export const ANALYTICS_INFO_TIMER_INTERVAL = process.env.NODE_ENV === 'development' ? 5000 : 10000;

export const ANALYTICS_SEARCH_DEBOUNCE_TIME = 3000;

export const ANALYTICS_EVENT_LOG = 'log';
export const ANALYTICS_EVENT_ERROR = 'error';
export const ANALYTICS_EVENT_INFO = 'info';

export const ANALYTICS_ACTION_STR = 'action';
export const ANALYTICS_SUBMIT_STR = 'submit';
export const ANALYTICS_SELECTED_STR = 'selected';
export const ANALYTICS_RENDERED_STR = 'rendered';
export const ANALYTICS_DISPLAYED_STR = 'displayed';
export const ANALYTICS_INPUT_STR = 'input';

export const ANALYTICS_DOWNLOAD_STR = 'download';

export const ANALYTICS_VALIDATION_ERROR_STR = 'validationError';

export const ANALYTICS_FOCUS_STR = 'focus';
export const ANALYTICS_UNFOCUS_STR = 'unfocus';

export const ANALYTICS_CONFIGURED_STR = 'configured';

export const ANALYTICS_QR_CODE_DOWNLOAD = 'qr_download_button';

export const ANALYTICS_INSTANT_PAYMENT_BUTTON = 'instant_payment_button';
export const ANALYTICS_FEATURED_ISSUER = 'featured_issuer';
export const ANALYTICS_LIST = 'list';
export const ANALYTICS_LIST_SEARCH = 'list_search';

export const ANALYTICS_IMPLEMENTATION_ERROR = 'ImplementationError';
export const ANALYTICS_API_ERROR = 'ApiError';
export const ANALYTICS_SDK_ERROR = 'SdkError';
export const ANALYTICS_NETWORK_ERROR = 'Network';
export const ANALYTICS_INTERNAL_ERROR = 'Internal';

export const ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_PAYMENT_DATA = 'web_700'; // Missing 'paymentData' property from threeDS2 action
export const ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_TOKEN = 'web_701'; // Missing 'token' property from threeDS2 action`
export const ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_THREEDSMETHODURL = 'web_702'; // Decoded token is missing a valid threeDSMethodURL property

/**
 * Decoded token is missing one or more of the following properties:
 *  fingerprint: (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)
 *  challenge: (acsTransID | messageVersion | threeDSServerTransID)
 */
export const ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_OTHER_PROPS = 'web_703';

export const ANALYTICS_ERROR_CODE_TOKEN_DECODE_OR_PARSING_FAILED = 'web_704'; // token decoding or parsing has failed. ('not base64', 'malformed URI sequence' or 'Could not JSON parse token')
export const ANALYTICS_ERROR_CODE_3DS2_TIMEOUT = 'web_705'; // 3DS2 process has timed out

export const ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_ACSURL = 'web_800'; // Decoded token is missing a valid acsURL property
export const ANALYTICS_ERROR_CODE_NO_TRANSSTATUS = 'web_801'; // Challenge has resulted in an error (no transStatus could be retrieved by the backend)

export const errorCodeMapping = {
    ['error.va.sf-cc-num.02']: '900',
    ['error.va.sf-cc-num.04']: '901',
    ['error.va.sf-cc-num.01']: '902',
    ['error.va.sf-cc-num.03']: '903',
    //
    ['error.va.sf-cc-dat.04']: '910',
    ['error.va.sf-cc-dat.05']: '911',
    ['error.va.sf-cc-dat.01']: '912',
    ['error.va.sf-cc-dat.02']: '913',
    ['error.va.sf-cc-dat.03']: '914',
    ['error.va.sf-cc-mth.01']: '915',
    ['error.va.sf-cc-yr.01']: '917',
    ['error.va.sf-cc-yr.02']: '918',
    //
    ['error.va.sf-cc-cvc.01']: '920',
    ['error.va.sf-cc-cvc.02']: '921',
    //
    ['creditCard.holderName.invalid']: '925',
    //
    ['boleto.socialSecurityNumber.invalid']: '926',
    //
    ['error.va.gen.01.country']: '930',
    ['error.va.gen.01.street']: '931',
    ['error.va.gen.01.house_number_or_name']: '932',
    ['error.va.gen.01.postal_code']: '933',
    ['invalidFormatExpects.postal_code']: '934',
    ['error.va.gen.01.city']: '935',
    ['error.va.gen.01.state_or_province']: '936',
    //
    ['error.va.sf-kcp-pwd.01']: '940',
    ['error.va.sf-kcp-pwd.02']: '941',
    ['creditCard.taxNumber.invalid']: '942',
    //
    ['error.va.sf-ach-num.01']: '945',
    ['error.va.sf-ach-num.02']: '946',
    ['error.va.sf-ach-loc.01']: '947',
    ['error.va.sf-ach-loc.02']: '948'
};

export const ANALYTICS_EXPRESS_PAGES_ARRAY = ['cart', 'minicart', 'pdp', 'checkout'];

export const ALLOWED_ANALYTICS_DATA = ['applicationInfo', 'checkoutAttemptId'];

export enum Analytics3DS2Events {
    FINGERPRINT_DATA_SENT = 'fingerprintDataSentWeb',
    FINGERPRINT_IFRAME_LOADED = 'fingerprintIframeLoaded',
    FINGERPRINT_COMPLETED = 'fingerprintCompleted',
    CHALLENGE_DATA_SENT = 'challengeDataSentWeb',
    CHALLENGE_IFRAME_LOADED = 'challengeIframeLoaded',
    CHALLENGE_COMPLETED = 'challengeCompleted'
}
