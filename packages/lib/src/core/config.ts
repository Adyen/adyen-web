/**
 * Asserts that a value is defined and throws an error if it is not.
 *
 * @param value The value to check.
 * @param message The error message to throw if the value is undefined.
 * @returns The value if it is defined.
 */
function assertDefined<T>(value: T | undefined, message: string): T {
    if (value === undefined || value === null) {
        throw new Error(message);
    }
    return value;
}

/**
 * FALLBACK_CONTEXT
 */
export const FALLBACK_CONTEXT = 'https://checkoutshopper-live.adyen.com/checkoutshopper/';

/**
 * Library version injected at build time.
 * Always defined - the build process ensures this value is set.
 */
export const LIBRARY_VERSION = assertDefined(process.env.VERSION, 'LIBRARY_VERSION is not defined');

/**
 * Bundle type injected at build time.
 * Always defined - the build process ensures this value is set.
 */
export const LIBRARY_BUNDLE_TYPE = assertDefined(process.env.BUNDLE_TYPE, 'BUNDLE_TYPE is not defined');

export const GENERIC_OPTIONS = [
    'amount',
    'secondaryAmount',
    'countryCode',
    'environment',
    '_environmentUrls',
    'loadingContext',
    'i18n',
    'modules',
    'order',
    'session',
    'clientKey',
    'showPayButton',
    'redirectFromTopWhenInIframe',
    'donation',

    // Events
    'onPaymentCompleted',
    'onPaymentFailed',
    'beforeRedirect',
    'beforeSubmit',
    'onSubmit',
    'onReadyForReview',
    'onActionHandled',
    'onAdditionalDetails',
    'onChange',
    'onEnterKeyPressed',
    'onError',
    'onBalanceCheck',
    'onOrderCancel',
    'onOrderRequest',
    'onOrderUpdated',
    'onPaymentMethodsRequest'
];

export const DEFAULT_HTTP_TIMEOUT = 60000;

export default {
    FALLBACK_CONTEXT,
    GENERIC_OPTIONS,
    DEFAULT_HTTP_TIMEOUT
};

/**
 * @internal
 */

export enum CHANNEL {
    WEB = 'web'
}

/**
 * @internal
 */
export const PLATFORM = 'web';

/**
 * How the SDK handles the rendering of a payment method.
 *
 * - NATIVE: The payment method has a dedicated component in the SDK.
 * - GENERIC: The payment method has no dedicated component; it falls back to a generic component (Redirect).
 * @internal
 */
export enum PAYMENT_METHOD_BEHAVIOR {
    NATIVE = 'nativeComponent',
    GENERIC = 'genericComponent'
}
