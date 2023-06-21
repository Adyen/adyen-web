export const ANALYTICS_ACTION_LOG = 'log';
export const ANALYTICS_ACTION_ERROR = 'error';
export const ANALYTICS_ACTION_EVENT = 'event';

export const ANALYTICS_ACTION_STR = 'Action';
export const ANALYTICS_SUBMIT_STR = 'Submit';

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
export const ANALYTICS_ERROR_CODE_MISMATCHING_TRANS_IDS = 'web_802'; // threeDSServerTransID: ids do not match
