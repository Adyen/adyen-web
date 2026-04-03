import { h } from 'preact';
import { CustomTranslations } from './types';
import { DEFAULT_LOCALE } from './constants';

/**
 * Convert to ISO 639-1
 */
const toTwoLetterCode = locale => locale.toLowerCase().substring(0, 2);

/**
 * Matches a string with one of the locales
 *
 * @param locale - The locale to match
 * @param supportedLocales - Array of possible locales
 *
 * @example
 * matchLocale('en-GB', ['en-US', 'es-ES']);
 * // returns 'en-US'
 */
export function matchLocale(locale: string, supportedLocales: readonly string[]): string {
    if (!locale || typeof locale !== 'string') return null;
    return supportedLocales.find(supLoc => toTwoLetterCode(supLoc) === toTwoLetterCode(locale)) || null;
}

/**
 * Returns a locale with the proper format.
 *
 * @param localeParam - Locale example: 'En_us' or 'en-US'
 *
 * @example
 * formatLocale('En_us');
 * // returns 'en-US'
 */
export function formatLocale(localeParam: string): string | null {
    const locale = localeParam.replace('_', '-');
    const format = new RegExp('^([a-z]{2})([-])([A-Z]{2})$');

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

export function parseLocale(locale: string, supportedLocales: readonly string[]): string {
    if (!locale || locale.length < 1 || locale.length > 5) return DEFAULT_LOCALE;

    const formattedLocale = formatLocale(locale);
    const hasMatch = supportedLocales.indexOf(formattedLocale) > -1;

    if (hasMatch) return formattedLocale;

    return matchLocale(formattedLocale || locale, supportedLocales) || DEFAULT_LOCALE;
}

/**
 * Makes sure that if custom translation is defined using not properly formatted locale keys, then it gets formatted correctly

 * Custom translation defined as { en_US: { ... }} will be adjusted to { 'en-US': { ... }}
 */
export function formatCustomTranslations(customTranslations: CustomTranslations = {}): CustomTranslations {
    return Object.keys(customTranslations).reduce((memo, customTranslationLocaleKey) => {
        const locale = formatLocale(customTranslationLocaleKey);
        memo[locale] = customTranslations[customTranslationLocaleKey];
        return memo;
    }, {});
}

const replaceTranslationValues = (translation, values) => {
    return translation.replace(/%{(\w+)}/g, (_, k) => values[k] || '');
};

/**
 * Returns a translation string by key
 * @param translations -
 * @param key -
 * @param options -
 *
 * @internal
 */
export const getTranslation = (translations: object, key: string, options: { [key: string]: any } = { values: {}, count: 0 }): string => {
    const keyPlural = `${key}__plural`;
    const keyForCount = count => `${key}__${count}`;

    if (Object.prototype.hasOwnProperty.call(translations, keyForCount(options.count))) {
        // Find key__count translation key
        return replaceTranslationValues(translations[keyForCount(options.count)], options.values);
    } else if (Object.prototype.hasOwnProperty.call(translations, keyPlural) && options.count > 1) {
        // Find key__plural translation key, if count greater than 1 (e.g. myTranslation__plural)
        return replaceTranslationValues(translations[keyPlural], options.values);
    } else if (Object.prototype.hasOwnProperty.call(translations, key)) {
        // Find key translation key (e.g. myTranslation)
        return replaceTranslationValues(translations[key], options.values);
    }

    return null;
};

/**
 * Injects JSX elements in a middle of a translation and returns a JSX array
 * The input string should use %# as the token to know where to insert the component
 * @param translation - Translation string
 * @param renderFunctions - An array function that renders JSX elements
 */
export const interpolateElement = (translation: string, renderFunctions: Array<(translation: string) => h.JSX.Element | string>) => {
    // splits by regex group, it guarantees that it only splits with 2 tokens (%#)
    const matches = translation.split(/%#(.*?)%#/gm);

    if (renderFunctions.length !== Math.floor(matches.length / 2)) {
        throw Error('The number of functions provided does not match the number of elements in the translation string.');
    }

    // the map will create an array of JSX / string elements, this syntax in accepted in JSX/react to render elements
    return matches.map((term, index) => {
        // math to get the index of the renderFunction that should be used
        // since we split on tokens, that means the index of the render function is half of the index of the string
        const indexInFunctionArray = Math.floor(index / 2);
        return index % 2 === 0 ? term : renderFunctions[indexInFunctionArray](term);
    });
};
