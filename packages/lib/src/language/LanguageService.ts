import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';
import { httpGet } from '../core/Services/http';
import type { Translations } from './types';

export interface ILanguageService {
    fetchTranslations(locale: string): Promise<any>;
}

class LanguageService implements ILanguageService {
    private readonly cdnUrl: string;
    private readonly sdkVersion: string;

    constructor({ cdnUrl, sdkVersion }: { cdnUrl: string; sdkVersion: string }) {
        this.cdnUrl = cdnUrl;
        this.sdkVersion = sdkVersion;
    }

    public async fetchTranslations(locale: string): Promise<Translations> {
        if (!locale) {
            throw new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'fetchTranslations() - locale is required');
        }

        try {
            return await httpGet<Translations>({
                loadingContext: this.cdnUrl,
                errorLevel: 'fatal',
                errorMessage: `Translations: Failed to fetch translations for locale "${locale}"`,
                path: `sdk/${this.sdkVersion}/translations/${locale}.json`
            });
        } catch (error) {
            return await httpGet<Translations>({
                loadingContext: this.cdnUrl,
                errorLevel: 'fatal',
                errorMessage: `Translations: Couldn't fetch translation for locale "${locale}" nor the fallback translation "en-US"`,
                path: `sdk/${this.sdkVersion}/translations/en-US.json`
            });
        }
    }
}

export { LanguageService };
