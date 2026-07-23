const INTEGRATION_DATE = '2020-02-01';
const PAYPAL_JS_URL_V5 = 'https://www.paypal.com/sdk/js';
const ADYEN_CLIENTID_V5_TEST = 'AXy9hIzWB6h_LjZUHjHmsbsiicSIbL4GKOrcgomEedVjduUinIU4C2llxkW5p0OG0zTNgviYFceaXEnj';
const ADYEN_CLIENTID_V5_LIVE = 'AU0Z-TP9t5_9196agaBN6ZD3UAwypdP1IX8ZYH3PcNNAQMXUTDQlChruXqQEhyI6-NKBKowN6ydkj477';

const PAYPAL_SDK_URL_PRODUCTION = 'https://www.paypal.com/web-sdk/v6/core';
const PAYPAL_SDK_URL_SANDBOX = 'https://www.sandbox.paypal.com/web-sdk/v6/core';

const SUPPORTED_COLORS_FOR_CREDIT = ['black', 'white'];

const SUPPORTED_LOCALES = [
    'en_US',
    'en_AU',
    'en_GB',
    'fr_CA',
    'es_ES',
    'it_IT',
    'fr_FR',
    'de_DE',
    'pt_BR',
    'zh_CN',
    'da_DK',
    'zh_HK',
    'id_ID',
    'he_IL',
    'ja_JP',
    'ko_KR',
    'nl_NL',
    'no_NO',
    'pl_PL',
    'pt_PT',
    'ru_RU',
    'sv_SE',
    'th_TH',
    'zh_TW'
] as const;

const DEFAULT_PAYMENT_SESSION_OPTIONS = {
    presentationMode: 'auto'
} as const;

export {
    INTEGRATION_DATE,
    PAYPAL_JS_URL_V5,
    ADYEN_CLIENTID_V5_TEST,
    ADYEN_CLIENTID_V5_LIVE,
    SUPPORTED_LOCALES,
    SUPPORTED_COLORS_FOR_CREDIT,
    PAYPAL_SDK_URL_PRODUCTION,
    PAYPAL_SDK_URL_SANDBOX,
    DEFAULT_PAYMENT_SESSION_OPTIONS
};
