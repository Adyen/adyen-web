import { FALLBACK_LOCALE, defaultTranslation } from './config';
import locales from './locales';
import { h } from 'preact';

/**
 * Convert to ISO 639-1
 */
const toTwoLetterCode = locale => locale.toLowerCase().substring(0, 2);

/**
 * Matches a string with one of the locales
 * @param locale -
 * @param supportedLocales -

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
 * @param localeParam -
 *
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
 * @param locale -
 * @param supportedLocales -
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
 * @param customTranslations -
 * @param supportedLocales -
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
 * Returns an Object which contains all the key/values of the translation labels
 *
 * @param locale - The locale the user wants to use
 * @param customTranslations - Custom translations provided by the merchant
 */
export const loadTranslations = async (locale: string, customTranslations: object = {}): Promise<Record<string, string>> => {
    // Match locale to one of our available locales (e.g. es-AR => es-ES)
    const localeToLoad = parseLocale(locale, Object.keys(locales)) || FALLBACK_LOCALE;
    const loadedLocale = await locales[localeToLoad]();

    return {
        ...defaultTranslation, // Default en-US translations (in case any other translation file is missing any key)
        ...loadedLocale.default, // Merge with our locale file of the locale they are loading
        ...(!!customTranslations[locale] && customTranslations[locale]) // Merge with their custom locales if available
    };
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
