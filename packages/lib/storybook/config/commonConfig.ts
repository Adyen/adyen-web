export const protocol = window.location.protocol; // gives 'http:' or 'https:' i.e. adds the colon
export const DEFAULT_SHOPPER_LOCALE = 'en-US';
export const DEFAULT_COUNTRY_CODE = 'US';
export const DEFAULT_AMOUNT_VALUE = 25900;
export const SHOPPER_REFERENCE = 'newshoppert';
export const RETURN_URL = `${protocol}//localhost:3020/?path=/story/helpers-redirectresult--redirect-result`;
export const SHOPPER_LOCALES = [
    'ar',
    'bg-BG',
    'ca-ES',
    'cs-CZ',
    'da-DK',
    'de-DE',
    'el-GR',
    'en-US',
    'es-ES',
    'et-EE',
    'fi-FI',
    'fr-FR',
    'hr-HR',
    'hu-HU',
    'is-IS',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'lt-LT',
    'lv-LV',
    'nl-NL',
    'no-NO',
    'pl-PL',
    'pt-BR',
    'pt-PT',
    'ro-RO',
    'ru-RU',
    'sk-SK',
    'sl-SI',
    'sv-SE',
    'zh-CN',
    'zh-TW'
];

export const STORYBOOK_ENVIRONMENT_URLS = {
    cdn: {
        translations: '/'
    }
};
