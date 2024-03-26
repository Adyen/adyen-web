import { httpGet, HttpOptions } from './http';
import type { CustomTranslations, Translations } from '../../language/types';
import { SUPPORTED_LOCALES } from '../../language/constants';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';

export default function getTranslations(
    cdnContext: string,
    adyenWebVersion: string,
    locale: string,
    translationEnvironment: 'local' | 'remote',
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
        loadingContext: translationEnvironment === 'local' ? '/' : cdnContext,
        errorLevel: 'fatal',
        errorMessage: `Translations: Couldn't fetch translation for the locale "${locale}".`,
        path: `translations/${adyenWebVersion}/${locale}.json`
    };

    return httpGet(options);
}
