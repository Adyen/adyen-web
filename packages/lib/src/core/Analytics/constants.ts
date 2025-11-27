import {
    BOLETO_SOCIAL_SECURITY_NUMBER_INVALID,
    CREDITCARD_HOLDER_NAME_INVALID,
    CREDITCARD_TAX_NUMBER_INVALID,
    ERROR_FIELD_REQUIRED,
    ERROR_INVALID_FORMAT_EXPECTS
} from '../Errors/constants';

export const ANALYTICS_PATH = 'v3/analytics';

export const ANALYTICS_SEARCH_DEBOUNCE_TIME = 3000;

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

export const NO_CHECKOUT_ATTEMPT_ID = 'fetch-checkoutAttemptId-failed';
