import { h } from 'preact';
import { CustomTranslations } from './types';
import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';

/**
 * Returns a locale with the proper format
 *
 * @example
 * formatLocale('En_us'); -> en-US
 * formatLocale('ar') -> ar
 */
export function formatLocale(localeParam: string): string {
    const locale = localeParam.replace('_', '-');
    const format = new RegExp('([a-z]{2})([-])([A-Z]{2})');

    // If it's already formatted, return the locale
    if (format.test(locale)) {
        return locale;
    }

    // If no country code is defined (Ex: 'ar') , then returns 'ar'
    const [languageCode, countryCode] = locale.split('-');
    if (languageCode.length !== 2) {
        throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', `Locale '${localeParam}' does not match the expected format`);
    }
    if (!countryCode) {
        return languageCode.toLowerCase();
    }

    // Ensure correct format and join the strings back together
    const fullLocale = [languageCode.toLowerCase(), countryCode.toUpperCase()].join('-');
    if (format.test(fullLocale)) {
        return fullLocale;
    } else {
        throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', `Locale '${localeParam}' does not match the expected format`);
    }
}

/**
 * Makes sure that if custom translation is defined using not properly formatted locale keys, then it gets formatted correctly
 * Ex: Custom translation defined as { en_US: { ... }} will be adjusted to { 'en-US': { ... }}
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
