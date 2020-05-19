import { FALLBACK_LOCALE } from './config';
import defaultTranslation from './locales/en-US.json';
import locales from './locales';

// Convert to ISO 639-1
const toTwoLetterCode = locale => locale.toLowerCase().substring(0, 2);

/**
 * Matches a string with one of the locales
 * @param {string} locale
 * @param {object[]} supportedLocales
 * @return {string}
 * @example
 * matchLocale('en-GB');
 * // 'en-US'
 */
export function matchLocale(locale: string, supportedLocales: any): string {
    if (!locale || typeof locale !== 'string') return null;
    return supportedLocales.find(supLoc => toTwoLetterCode(supLoc) === toTwoLetterCode(locale)) || null;
}

/**
 * Returns a locale with the proper format
 * @param {string} localeParam
 * @return {string}
 * @example
 * formatLocale('En_us');
 * // 'en-US'
 */
export function formatLocale(localeParam: string): string {
    const locale = localeParam.replace('_', '-');
    const format = new RegExp('([a-z]{2})([-])([A-Z]{2})');

    // If it's already formatted, return the locale
    if (format.test(locale)) return locale;

    // Split the string in two
    const [languageCode, countryCode] = locale.split('-');

    // If the locale or the country codes are missing, return null
    if (!languageCode || !countryCode) return null;

    // Ensure correct format and join the strings back together
    const fullLocale = [languageCode.toLowerCase(), countryCode.toUpperCase()].join('-');

    return fullLocale.length === 5 ? fullLocale : null;
}

/**
 * Checks the locale format.
 * Also checks if it's on the locales array.
 * If it is not, tries to match it with one.
 * @param {string} locale
 * @param {string[]} supportedLocales
 * @return {string}
 */
export function parseLocale(locale: string, supportedLocales: string[] = []): string {
    if (!locale || locale.length < 1 || locale.length > 5) return FALLBACK_LOCALE;

    const formattedLocale = formatLocale(locale);
    const hasMatch = supportedLocales.indexOf(formattedLocale) > -1;

    if (hasMatch) return formattedLocale;

    return matchLocale(formattedLocale || locale, supportedLocales);
}

/**
 * Formats the locales inside the customTranslations object against the supportedLocales
 * @param {Object} customTranslations
 * @param {Array} supportedLocales
 * @return {Object}
 */
export function formatCustomTranslations(customTranslations: object = {}, supportedLocales: string[]): object {
    return Object.keys(customTranslations).reduce((acc, cur) => {
        const formattedLocale = formatLocale(cur) || parseLocale(cur, supportedLocales);
        if (formattedLocale) {
            acc[formattedLocale] = customTranslations[cur];
        }

        return acc;
    }, {});
}

/**
 * Returns a translation string by key
 * @param {Object} translations
 * @param {string} key
 * @private
 */
export const getTranslation = (translations: object, key: string): string => {
    if (Object.prototype.hasOwnProperty.call(translations, key)) {
        return translations[key];
    }

    return null;
};

/**
 * Returns an array with all the locales
 * @param {string} locale The locale the user wants to use
 * @param {Object} customTranslations
 * @return {Promise<object>}
 */
export const loadTranslations = (locale: string, customTranslations: object = {}) => {
    // Match locale to one of our available locales (e.g. es-AR => es-ES)
    const localeToLoad = parseLocale(locale, Object.keys(locales)) || FALLBACK_LOCALE;

    return {
        ...defaultTranslation, // Default en-US translations (in case any other translation file is missing any key)
        ...locales[localeToLoad], // Merge with our locale file of the locale they are loading
        ...(customTranslations[locale] && customTranslations[locale]) // Merge with their custom locales if available
    };
};
