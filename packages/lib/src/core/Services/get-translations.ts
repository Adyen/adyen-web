import { httpGet, HttpOptions } from './http';
import { SUPPORTED_LOCALES } from '../../language/constants';
import AdyenCheckoutError from '../Errors/AdyenCheckoutError';

import type { CustomTranslations, Translations } from '../../language/types';

export default function getTranslations(
    loadingContext: string,
    adyenWebVersion: string,
    locale: string,
    customTranslations: CustomTranslations = {}
): Promise<Translations> {
    const isUsingCustomLocaleNotSupportedByAdyen = SUPPORTED_LOCALES.includes(locale) === false && Object.keys(customTranslations).includes(locale);
    if (isUsingCustomLocaleNotSupportedByAdyen) {
        return Promise.resolve({});
    }

    if (SUPPORTED_LOCALES.includes(locale) === false) {
        throw new AdyenCheckoutError(
            'IMPLEMENTATION_ERROR',
            `Translations: Locale '${locale}' is not supported. You can provide your own locale/translations by configuring the 'translations' property"`
        );
    }

    const options: HttpOptions = {
        /** in development mode, we load translations from our local server */
        loadingContext: process.env.NODE_ENV === 'development' ? '/' : loadingContext,
        errorLevel: 'fatal',
        errorMessage: `Translations: Couldn't fetch translation for the locale "${locale}".`,
        path: `translations/${adyenWebVersion}/${locale}.json`
    };

    return httpGet(options);
}
