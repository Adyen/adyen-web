import { getTranslation } from './utils';
import { getLocalisedAmount } from '../utils/amount-util';
import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';

import type { CustomTranslations, LanguageOptions, Translations } from './types';

export class Language {
    public readonly locale: string;
    public readonly languageCode: string;

    private readonly translations: Translations;
    private readonly customTranslations: CustomTranslations;

    constructor(props: LanguageOptions) {
        const { locale, translations, customTranslations } = props;

        if (!locale) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Language: "locale" property is not defined');
        }

        this.locale = locale;
        this.languageCode = this.locale.split('-')[0];
        this.customTranslations = customTranslations || {};

        this.translations = {
            ...translations,
            ...(!!this.customTranslations[this.locale] && this.customTranslations[this.locale])
        };
    }

    /**
     * Returns a translated string from a key in the current {@link Language.locale}
     * @param key - Translation key
     * @param options - Translation options
     * @returns Translated string
     */
    public get(key: string, options?): string {
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
    public amount(amount: number, currencyCode: string, options?: object): string {
        return getLocalisedAmount(amount, this.locale, currencyCode, options);
    }

    /**
     * Returns a localized string for a date
     * @param date - Date to be localized
     * @param options - Options for {@link Date.toLocaleDateString}
     */
    public date(date: string, options: object = {}) {
        const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', ...options };
        return new Date(date).toLocaleDateString(this.locale, dateOptions);
    }
}

export default Language;
