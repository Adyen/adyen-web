import defaultTranslation from './locales/en-US.json';
import { formatCustomTranslations, formatLocale, getTranslation, loadTranslations, parseLocale } from './utils';
import { FALLBACK_LOCALE } from './config';
import locales from './locales';
import { getLocalisedAmount } from '~/utils/amount-util';

export class Language {
    constructor(locale: string = FALLBACK_LOCALE, customTranslations: object = {}) {
        const defaultLocales = Object.keys(locales);
        this.customTranslations = formatCustomTranslations(customTranslations, defaultLocales);

        const localesFromCustomTranslations = Object.keys(this.customTranslations);
        this.supportedLocales = [...defaultLocales, ...localesFromCustomTranslations].filter((v, i, a) => a.indexOf(v) === i); // our locales + validated custom locales
        this.locale = formatLocale(locale) || parseLocale(locale, this.supportedLocales) || FALLBACK_LOCALE;

        this.translations = loadTranslations(this.locale, this.customTranslations);
    }

    public readonly locale: string;
    private readonly supportedLocales: string[];
    public translations: object = defaultTranslation;
    public readonly customTranslations;

    /**
     * Returns a translated string from a key and a locale
     * @param {string} key
     * @return {string}
     */
    get(key: string): string {
        const translation = getTranslation(this.translations, key);
        if (translation !== null) {
            return translation;
        }

        return key;
    }

    /**
     * Returns a localized string for an amount
     * @param {number} amount
     * @param {string} currencyCode
     * @param {object} options
     * @return {string}
     */
    amount(amount: number, currencyCode: string, options?: object): string {
        return getLocalisedAmount(amount, this.locale, currencyCode, options);
    }

    /**
     * Returns a localized string for a date
     * @param {string} date
     * @param {object} options for [Date.prototype.toLocaleDateString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString)
     * @return {string}
     */
    date(date: string, options: object = {}) {
        const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit', ...options };
        return new Date(date).toLocaleDateString(this.locale, dateOptions);
    }
}

export default Language;
