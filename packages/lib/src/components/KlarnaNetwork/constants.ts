/**
 * Klarna forbids self-hosting or bundling the Web SDK: it must always be fetched from their CDN.
 * @see https://docs.klarna.com/klarna-network-distribution/
 */
export const KLARNA_WEB_SDK_URL = 'https://js.klarna.com/web-sdk/v2/klarna.mjs';

export const KLARNA_MESSAGE_CONTAINER_ID = 'klarna-message-container';

export const KLARNA_BUTTON_CONTAINER_ID = 'klarna-button-container';

/**
 * POC placeholders. Klarna requires the serving domain to be registered as an allowed client origin
 * against the clientId; 'http://localhost:3020' already is. Override them per story from the
 * credentials form above the component.
 */
export const POC_CLIENT_ID = '';
export const POC_PAYMENT_ACCOUNT_ID = '';

/**
 * Payment option ids the Klarna Web SDK hardcodes into the presentation it substitutes when its own
 * presentation API rejects the request with `401 PERMISSION_DENIED` on
 * `/cma/v4/messaging/presentation`. The SDK swallows that failure, so the integration looks healthy:
 * a generic message and pay button render, but no Klarna session sits behind them.
 */
export const KLARNA_FALLBACK_PAYMENT_OPTION_IDS: readonly string[] = ['KLARNA', 'CHANGE_PLAN', 'SAVED_PAYMENT_OPTION'];

export const ERRORS = {
    MISSING_CLIENT_ID: "KlarnaNetwork: a 'clientId' is required to initialise the Klarna Web SDK",
    SDK_NOT_READY: 'KlarnaNetwork: the Klarna Web SDK is not ready yet',
    SDK_LOAD_FAILED: 'KlarnaNetwork: failed to load the Klarna Web SDK',
    PRESENTATION_FAILED: 'KlarnaNetwork: failed to fetch the Klarna payment presentation',
    MISSING_AMOUNT: 'KlarnaNetwork: a valid amount with a currency is required to fetch the Klarna payment presentation',
    SUBMIT_NOT_SUPPORTED:
        'KlarnaNetwork: submit() is not supported while the native Klarna pay button is shown. The button drives the payment itself.',
    AUTHORIZATION_FAILED: 'KlarnaNetwork: the payment authorization failed'
} as const;

/** Short, stable identifiers sent to analytics alongside the human readable message. */
export const ERROR_CODES = {
    SDK_LOAD_FAILED: 'klarna_network_sdk_load_failed',
    PRESENTATION_FAILED: 'klarna_network_presentation_failed'
} as const;
