import {
    BOLETO_SOCIAL_SECURITY_NUMBER_INVALID,
    CREDITCARD_HOLDER_NAME_INVALID,
    CREDITCARD_TAX_NUMBER_INVALID,
    ERROR_FIELD_REQUIRED,
    ERROR_INVALID_FORMAT_EXPECTS
} from '../Errors/constants';

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
export const ANALYTICS_API_ERROR = 'APIError';

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

/**
 * Function to map errorCodes based on translation keys to the codes expected by the analytics endpoint
 */
export const errorCodeMapping: Record<string, string> = {
    [CREDITCARD_HOLDER_NAME_INVALID]: '925',
    [CREDITCARD_TAX_NUMBER_INVALID]: '942',
    //
    [BOLETO_SOCIAL_SECURITY_NUMBER_INVALID]: '926',
    //
    [`${ERROR_FIELD_REQUIRED}.country`]: '930',
    [`${ERROR_FIELD_REQUIRED}.street`]: '931',
    [`${ERROR_FIELD_REQUIRED}.house_number_or_name`]: '932',
    [`${ERROR_FIELD_REQUIRED}.postal_code`]: '933',
    [`${ERROR_FIELD_REQUIRED}.city`]: '935',
    [`${ERROR_FIELD_REQUIRED}.state_or_province`]: '936',
    //
    [`${ERROR_INVALID_FORMAT_EXPECTS}.postal_code`]: '934'
    //
};

export const ANALYTICS_EXPRESS_PAGES_ARRAY = ['cart', 'minicart', 'pdp', 'checkout'];

export const ALLOWED_ANALYTICS_DATA = ['applicationInfo'];
