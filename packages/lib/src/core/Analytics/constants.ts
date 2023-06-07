export const ANALYTICS_DATA_LOG = 'log';
export const ANALYTICS_DATA_ERROR = 'error';
export const ANALYTICS_DATA_EVENT = 'event';

export const ANALYTICS_API_ERROR = 'API_Error';

export const ANALYTICS_ERROR_ACTION_IS_MISSING_PAYMENT_DATA = 'web_700'; // Missing 'paymentData' property from threeDS2 action
export const ANALYTICS_ERROR_ACTION_IS_MISSING_TOKEN = 'web_701'; // Missing 'token' property from threeDS2 action`
export const ANALYTICS_ERROR_TOKEN_IS_MISSING_THREEDSMETHODURL = 'web_702'; // Decoded token is missing a valid threeDSMethodURL property
export const ANALYTICS_ERROR_TOKEN_IS_MISSING_OTHER_PROPS = 'web_703'; // Decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)
export const ANALYTICS_ERROR_TOKEN_DECODE_OR_PARSING_FAILED = 'web_704'; // token decoding or parsing has failed. ('not base64', 'malformed URI sequence' or 'Could not JSON parse token')
export const ANALYTICS_ERROR_3DS2_FINGERPRINT_TIMEOUT = 'web_705'; // 3DS2 fingerprinting process has timed out
