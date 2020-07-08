const AMAZONPAY_SIGNATURE_ENDPOINT = 'v1/AmazonPayUtility/signString';

const AMAZONPAY_URL_EU = 'https://static-eu.payments-amazon.com/checkout.js';
const AMAZONPAY_URL_US = 'https://static-na.payments-amazon.com/checkout.js';

const FALLBACK_LOCALE_EU = 'en_GB';
const FALLBACK_LOCALE_US = 'en_US';

const SUPPORTED_LOCALES_EU = ['en_GB', 'de_DE', 'fr_FR', 'it_IT', 'es_ES'] as const;
const SUPPORTED_LOCALES_US = ['en_US'] as const;

export {
    AMAZONPAY_SIGNATURE_ENDPOINT,
    AMAZONPAY_URL_EU,
    AMAZONPAY_URL_US,
    FALLBACK_LOCALE_EU,
    FALLBACK_LOCALE_US,
    SUPPORTED_LOCALES_EU,
    SUPPORTED_LOCALES_US
};
