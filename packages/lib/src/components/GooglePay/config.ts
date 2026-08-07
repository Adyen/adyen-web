export default {
    API_VERSION: 2,
    API_VERSION_MINOR: 0,
    GATEWAY: 'adyen',
    URL: 'https://pay.google.com/gp/p/js/pay.js'
};

const URL_GOOGLE_PAY_ACCELERATED_CHECKOUT = 'https://pay.google.com/gp/p/js/acceleratedcheckout.js';

export enum GooglePaymentMode {
    STANDARD_BUTTON = 'standard_button',
    ACCELERATED_CHECKOUT = 'accelerated_checkout'
}

export { URL_GOOGLE_PAY_ACCELERATED_CHECKOUT };
