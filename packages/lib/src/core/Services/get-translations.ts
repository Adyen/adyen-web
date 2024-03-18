import { httpGet, HttpOptions } from './http';
import { DEFAULT_LOCALE, DEFAULT_TRANSLATION_FILE } from '../../language/config';

const TEMPORARY_URL = 'https://ribeiroguilherme--checkout-playground.netlify.app';

export default function getTranslations(locale = DEFAULT_LOCALE): Promise<Record<string, string>> {
    if (locale === DEFAULT_LOCALE) {
        return Promise.resolve(DEFAULT_TRANSLATION_FILE);
    }

    const options: HttpOptions = {
        loadingContext: TEMPORARY_URL,
        errorLevel: 'warn',
        errorMessage: `Translations: Couldn't fetch translation for the locale "${locale}".`,
        path: `/${locale}.json`
    };

    return httpGet(options);
}
