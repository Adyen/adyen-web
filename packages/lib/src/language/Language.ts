import { formatCustomTranslations, getTranslation } from './utils';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './config';
import { getLocalisedAmount } from '../utils/amount-util';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { CustomTranslations, Locale } from './types';
import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';

export class Language {
    private readonly supportedLocales: string[];

    public readonly locale: string;
    public readonly languageCode: string;
    public translations: Record<string, string>;
    public readonly customTranslations;

    constructor(locale: Locale = DEFAULT_LOCALE, customTranslations: CustomTranslations = {}, sessionLocale?: string) {
        if (typeof locale === 'string') {
            throw new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                "The 'locale' configuration property must not be a string. Make sure to set it using the proper Locale file."
            );
        }

        if (sessionLocale && sessionLocale !== locale.countryLanguageCode) {
            console.warn(
                `Language module: shopperLocale mismatch. 'locale' is set to '${locale.countryLanguageCode}', but session was created with '${sessionLocale}'. Make sure to set the correct locale on both properties`
            );
        }

        this.customTranslations = formatCustomTranslations(customTranslations, SUPPORTED_LOCALES);
        const localesFromCustomTranslations = Object.keys(this.customTranslations);
        this.supportedLocales = [...SUPPORTED_LOCALES, ...localesFromCustomTranslations].filter((v, i, a) => a.indexOf(v) === i); // our locales + validated custom locales
        this.locale = locale.countryLanguageCode;
        const [languageCode] = this.locale.split('-');
        this.languageCode = languageCode;

        this.translations = {
            ...DEFAULT_LOCALE.translations,
            ...locale.translations,
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
