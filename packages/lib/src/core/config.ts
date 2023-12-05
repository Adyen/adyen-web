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

    // Events
    'onPaymentCompleted',
    'onPaymentFailed',
    'beforeRedirect',
    'beforeSubmit',
    'onSubmit',
    'onActionHandled',
    'onAdditionalDetails',
    'onCancel',
    'onChange',
    'onError',
    'onBalanceCheck',
    'onOrderRequest',
    'onOrderCreated',
    'setStatusAutomatically'
];

export default {
    FALLBACK_CONTEXT,
    GENERIC_OPTIONS
};
