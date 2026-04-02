import { formatCustomTranslations, getTranslation, parseLocale } from './utils';
import { getLocalisedAmount } from '../utils/amount-util';
import { CDN_SUPPORTED_LOCALES } from './constants';
import enUS from '../../../server/translations/en-US.json';

import type { CustomTranslations, LanguageOptions, Translations } from './types';
import type { ILanguageService } from './LanguageService';

export class Language {
    public readonly locale: string;
    public readonly languageCode: string;
    private readonly service: ILanguageService;

    private readonly customTranslations: CustomTranslations;

    /**
     * Supported locales list
     * Includes all supported locales from the CDN and any custom locales defined in customTranslations
     */
    private readonly supportedLocales: readonly string[];

    private translations: Translations = {};

    public readonly timeFormatOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric'
    };

    public readonly timeAndDateFormatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...this.timeFormatOptions
    };

    public readonly timeAndDateFormatter: Intl.DateTimeFormat;

    constructor(props: LanguageOptions) {
        const { locale, customTranslations, service } = props;

        this.service = service;

        this.customTranslations = formatCustomTranslations(customTranslations);
        this.supportedLocales = this.createSupportedLocalesList(customTranslations);

        this.locale = parseLocale(locale, this.supportedLocales);
        this.languageCode = this.locale.split('-')[0];

        this.timeAndDateFormatter = Intl.DateTimeFormat(this.locale, this.timeAndDateFormatOptions);
    }

    public async requestTranslations(): Promise<void> {
        const translations = await this.service.fetchTranslationsFromCdn(this.locale);

        this.translations = {
            ...enUS,
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
     * @param options - Options for {@link Intl.DateTimeFormatOptions}
     */
    public date(date: string, options: Intl.DateTimeFormatOptions = {}) {
        if (date === undefined) return '';
        const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', ...options };
        return new Date(date).toLocaleDateString(this.locale, dateOptions);
    }

    /**
     * Returns a localized string for a date and time
     * @param date - Date to be localized
     */
    public dateTime(date: string) {
        if (date === undefined) return '';
        return this.timeAndDateFormatter.format(new Date(date));
    }

    /**
     * Creates a list of supported locales including the ones passed as custom translations
     *
     * @param customTranslations - Custom translations to include
     * @returns Array of supported locales
     */
    private createSupportedLocalesList(customTranslations?: CustomTranslations): readonly string[] {
        if (!customTranslations) {
            return CDN_SUPPORTED_LOCALES;
        }

        const locales = new Set([...CDN_SUPPORTED_LOCALES, ...Object.keys(customTranslations)]);
        return Array.from(locales).sort();
    }
}

export default Language;
