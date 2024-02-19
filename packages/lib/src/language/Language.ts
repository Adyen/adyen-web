import { formatCustomTranslations, formatLocale, getTranslation, parseLocale } from './utils';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, DEFAULT_TRANSLATION_FILE } from './config';
import { getLocalisedAmount } from '../utils/amount-util';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { CustomTranslations, Translation } from './types';

export class Language {
    private readonly supportedLocales: string[];
    public readonly locale: string;
    public readonly languageCode: string;
    public translations: Record<string, string>;
    public readonly customTranslations;

    constructor(locale = DEFAULT_LOCALE, customTranslations: CustomTranslations = {}, translationFile?: Translation) {
        this.customTranslations = formatCustomTranslations(customTranslations, SUPPORTED_LOCALES);
        const localesFromCustomTranslations = Object.keys(this.customTranslations);
        this.supportedLocales = [...SUPPORTED_LOCALES, ...localesFromCustomTranslations].filter((v, i, a) => a.indexOf(v) === i); // our locales + validated custom locales

        this.locale = formatLocale(locale) || parseLocale(locale, this.supportedLocales) || DEFAULT_LOCALE;
        this.languageCode = this.locale.split('-')[0];

        const isUsingCustomLocale = !SUPPORTED_LOCALES.includes(this.locale);

        if (!isUsingCustomLocale && this.locale !== DEFAULT_LOCALE && translationFile === undefined) {
            // In case the translation is not 'en-US' and there is no translation file provided
            console.warn(`Language module: 'translationFile' missing.  Make sure to pass the right 'translationFile' to the '${this.locale}' locale`);
        }

        this.translations = {
            ...DEFAULT_TRANSLATION_FILE,
            ...translationFile,
            ...(!!this.customTranslations[this.locale] && this.customTranslations[this.locale])
        };
    }

    /**
     * Returns a translated string from a key in the current {@link Language.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @returns Translated string
     */
    get(key: string, options?): string {
        const translation = getTranslation(this.translations, key, options);
        if (translation !== null) {
            return translation;
        }

        return key;
    }

    /**
     * Returns a localized string for an amount
     * @param amount - Amount to be converted
     * @param currencyCode - Currency code of the amount
     * @param options - Options for String.prototype.toLocaleString
     */
    amount(amount: number, currencyCode: string, options?: object): string {
        return getLocalisedAmount(amount, this.locale, currencyCode, options);
    }

    /**
     * Returns a localized string for a date
     * @param date - Date to be localized
     * @param options - Options for {@link Date.toLocaleDateString}
     */
    date(date: string, options: object = {}) {
        const dateOptions: DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', ...options };
        return new Date(date).toLocaleDateString(this.locale, dateOptions);
    }
}

export default Language;
