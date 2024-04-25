import { httpGet, HttpOptions } from './http';
import type { CustomTranslations, Translations } from '../../language/types';
import { SUPPORTED_LOCALES } from '../../language/constants';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';

export default function getTranslations(
    cdnTranslationsUrl: string,
    adyenWebVersion: string,
    locale: string,
    customTranslation: CustomTranslations = {}
): Promise<Translations> {
    const isUsingCustomLocaleNotSupportedByAdyen = !SUPPORTED_LOCALES.includes(locale) && Object.keys(customTranslation).includes(locale);

    if (isUsingCustomLocaleNotSupportedByAdyen) {
        return Promise.resolve({});
    }

    if (!SUPPORTED_LOCALES.includes(locale)) {
        throw new AdyenCheckoutError(
            'IMPLEMENTATION_ERROR',
            `Translations: Locale '${locale}' is not supported. You can provide your own locale/translations by configuring the 'translations' property"`
        );
    }

    const options: HttpOptions = {
        loadingContext: cdnTranslationsUrl,
        errorLevel: 'fatal',
        errorMessage: `Translations: Couldn't fetch translation for the locale "${locale}".`,
        path: `sdk/${adyenWebVersion}/translations/${locale}.json`
    };

    return httpGet(options);
}
