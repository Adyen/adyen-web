export const CDN_SUPPORTED_LOCALES = [
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
] as const;

export const DEFAULT_LOCALE = 'en-US';

/**
 * @description Minimum length is 2 according to BCP 47 standard (e.g. 'ar')
 */
export const LOCALE_NAME_MIN_LENGTH = 2;

/**
 * @description Maximum length is 5 because country/region codes can be a max of 5 characters according to BCP 47 standard (e.g. 'en-US')
 */
export const LOCALE_NAME_MAX_LENGTH = 5;
