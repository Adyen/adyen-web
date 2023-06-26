import { formatCustomTranslations, formatLocale, getTranslation, loadTranslations, parseLocale } from './utils';
import { FALLBACK_LOCALE, defaultTranslation } from './config';
// import locales from './locales';
import { getLocalisedAmount } from '../utils/amount-util';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export class Language {
    private readonly supportedLocales: string[];

    public readonly locale: string;
    public readonly languageCode: string;
    public translations: Record<string, string> = defaultTranslation;
    public readonly customTranslations;
    public loaded: Promise<any>;

    constructor(locale: string = FALLBACK_LOCALE, customTranslations: object = {}) {
        // const defaultLocales = Object.keys(locales);
        const defaultLocales = ['en-US'];
        this.customTranslations = formatCustomTranslations(customTranslations, defaultLocales);

        const localesFromCustomTranslations = Object.keys(this.customTranslations);
        this.supportedLocales = [...defaultLocales, ...localesFromCustomTranslations].filter((v, i, a) => a.indexOf(v) === i); // our locales + validated custom locales
        this.locale = formatLocale(locale) || parseLocale(locale, this.supportedLocales) || FALLBACK_LOCALE;
        const [languageCode] = this.locale.split('-');
        this.languageCode = languageCode;

        this.loaded = loadTranslations(this.locale, this.customTranslations).then(translations => {
            this.translations = translations;
        });
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
