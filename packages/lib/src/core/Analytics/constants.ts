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

export const ANALYTICS_EVENT = {
    log: 'log',
    error: 'error',
    info: 'info'
};

export const ANALYTICS_ERROR_TYPE = {
    network: 'Network',
    implementation: 'ImplementationError',
    internal: 'Internal',
    apiError: 'ApiError',
    sdkError: 'SdkError',
    thirdParty: 'ThirdParty',
    generic: 'Generic',
    redirect: 'Redirect',
    threeDS2: 'ThreeDS2'
};

export const ANALYTICS_ERROR_CODE = {
    redirect: '600'
};

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

export enum Analytics3DS2Errors {
    ACTION_IS_MISSING_PAYMENT_DATA = '700', // Missing 'paymentData' property from threeDS2 action
    ACTION_IS_MISSING_TOKEN = '701', // Missing 'token' property from threeDS2 action
    TOKEN_IS_MISSING_THREEDSMETHODURL = '702', // Decoded token is missing a valid threeDSMethodURL property

    /**
     * Decoded token is missing one or more of the following properties:
     *  fingerprint: (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)
     *  challenge: (acsTransID | messageVersion | threeDSServerTransID)
     */
    TOKEN_IS_MISSING_OTHER_PROPS = '703',

    TOKEN_DECODE_OR_PARSING_FAILED = '704', // token decoding or parsing has failed. ('not base64', 'malformed URI sequence' or 'Could not JSON parse token')
    THREEDS2_TIMEOUT = '705', // 3DS2 process has timed out

    TOKEN_IS_MISSING_ACSURL = '800', // Decoded token is missing a valid acsURL property
    NO_TRANSSTATUS = '801', // Challenge has resulted in an error (no transStatus could be retrieved by the backend)
    NO_DETAILS_FOR_FRICTIONLESS_OR_REFUSED = '802', // callSubmit3DS2Fingerprint has received a response indicating either a "frictionless" flow, or a "refused" response, but without a details object
    NO_COMPONENT_FOR_ACTION = '803', // callSubmit3DS2Fingerprint cannot find a component to handle the action response
    NO_ACTION_FOR_CHALLENGE = '804', // callSubmit3DS2Fingerprint has received a response indicating a "challenge" but without an action object
    CHALLENGE_RESOLVED_WITHOUT_RESULT_PROP = '805' // The challenge process has happened, an object has been returned, parsed & accepted as legit, but the result prop on that object is either missing or doesn't have a transStatus prop
}

export enum Analytics3DS2Events {
    FINGERPRINT_DATA_SENT = 'fingerprintDataSentWeb',
    FINGERPRINT_IFRAME_LOADED = 'fingerprintIframeLoaded',
    FINGERPRINT_COMPLETED = 'fingerprintCompleted',
    CHALLENGE_DATA_SENT = 'challengeDataSentWeb',
    CHALLENGE_IFRAME_LOADED = 'challengeIframeLoaded',
    CHALLENGE_COMPLETED = 'challengeCompleted'
}

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

export const ALLOWED_ANALYTICS_DATA = ['applicationInfo', 'checkoutAttemptId'];

export const NO_CHECKOUT_ATTEMPT_ID = 'fetch-checkoutAttemptId-failed';

export const ANALYTIC_LEVEL = {
    all: 'all',
    initial: 'initial'
};
