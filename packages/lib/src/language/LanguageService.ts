import { httpGet } from '../core/Services/http';
import enUS from '../../../server/translations/en-US.json';
import { matchLocale } from './utils';
import { CDN_SUPPORTED_LOCALES, DEFAULT_LOCALE } from './constants';
import type { Translations } from './types';
export interface ILanguageService {
    fetchTranslationsFromCdn(locale: string): Promise<Readonly<Translations>>;
}

class LanguageService implements ILanguageService {
    private readonly cdnUrl: string;
    private readonly sdkVersion: string;

    constructor({ cdnUrl, sdkVersion }: { cdnUrl: string; sdkVersion: string }) {
        this.cdnUrl = cdnUrl;
        this.sdkVersion = sdkVersion;
    }

    /**
     * Fetches translations for the given locale.
     * If locale is 'en-US', it returns the bundled 'en-US' translations. If the translation request fails, it returns 'en-US' as fallback
     *
     * @param locale - The locale to fetch translations for
     * @returns The translations for the given locale
     */
    public async fetchTranslationsFromCdn(locale: string): Promise<Readonly<Translations>> {
        const cdnLocale = this.matchLocaleWithCdnSupportedLocales(locale);

        if (cdnLocale === 'en-US') {
            return enUS as Translations;
        }

        try {
            return await httpGet<Translations>({
                loadingContext: this.cdnUrl,
                errorLevel: 'fatal',
                errorMessage: `Translations: Failed to fetch translations for locale "${cdnLocale}"`,
                path: `sdk/${this.sdkVersion}/translations/${cdnLocale}.json`
            });
        } catch (error) {
            console.log(`LanguageService - fetchTranslationsFromCdn(): Failed to fetch locale "${cdnLocale}."`);
            return enUS as Translations;
        }
    }

    /**
     * Matches the given locale with the supported locales in the CDN. For example, if the merchant passes 'fr-CH', it will match 'fr-FR'.
     *
     * @param locale - The locale to match
     * @returns The matched locale or the default locale
     */
    private matchLocaleWithCdnSupportedLocales(locale: string): string {
        return matchLocale(locale, CDN_SUPPORTED_LOCALES) || DEFAULT_LOCALE;
    }
}

export { LanguageService };
