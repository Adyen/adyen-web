/**
 * FALLBACK_CONTEXT
 */
export const FALLBACK_CONTEXT = 'https://checkoutshopper-live.adyen.com/checkoutshopper/';

export const GENERIC_OPTIONS = [
    'amount',
    'secondaryAmount',
    'countryCode',
    'environment',
    'loadingContext',
    'i18n',
    'modules',
    'order',
    'session',
    'clientKey',
    'showPayButton',
    'redirectFromTopWhenInIframe',
    'checkoutAttemptId',

    // Events
    'onPaymentCompleted',
    'onPaymentFailed',
    'beforeRedirect',
    'beforeSubmit',
    'onSubmit',
    'onActionHandled',
    'onAdditionalDetails',
    'onChange',
    'onError',
    'onBalanceCheck',
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
