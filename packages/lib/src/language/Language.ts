import { formatCustomTranslations, getTranslation, parseLocale } from './utils';
import { getLocalisedAmount } from '../utils/amount-util';
import { SUPPORTED_LOCALES } from './constants';

import type { CustomTranslations, LanguageOptions, Translations } from './types';
import type { ILanguageService } from './LanguageService';
import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';

export class Language {
    public readonly locale: string;
    public readonly languageCode: string;
    private readonly service: ILanguageService;

    private readonly customTranslations: CustomTranslations;
    private readonly supportedLocales: readonly string[];

    private readonly onError: LanguageOptions['onError'];

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
        const { locale, customTranslations, service, onError } = props;

        this.service = service;
        this.onError = onError;

        this.customTranslations = formatCustomTranslations(customTranslations);
        this.supportedLocales = this.createSupportedLocalesList(customTranslations);

        this.locale = parseLocale(locale, this.supportedLocales);
        this.languageCode = this.locale.split('-')[0];

        this.timeAndDateFormatter = Intl.DateTimeFormat(this.locale, this.timeAndDateFormatOptions);
    }

    public async requestTranslations(): Promise<void> {
        try {
            const translations = await this.service.fetchTranslations(this.locale);

            this.translations = {
                ...translations,
                ...(!!this.customTranslations[this.locale] && this.customTranslations[this.locale])
            };
        } catch (error: unknown) {
            if (error instanceof AdyenCheckoutError) {
                this.onError?.(error);
            } else {
                this.onError?.(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Failed to fetch translations', { cause: error }));
            }
        }
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
            return SUPPORTED_LOCALES;
        }

        const locales = new Set([...SUPPORTED_LOCALES, ...Object.keys(customTranslations)]);
        return Array.from(locales);
    }
}

export default Language;
