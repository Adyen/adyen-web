import { SUPPORTED_LOCALES } from '../config';
import type { PayPalSupportedLocale } from './types';

/**
 * Returns either a locale supported by PayPal or null, in order to let the PayPal SDK auto-detect the shopper locale.
 */
export const getSupportedLocale = (locale: string): PayPalSupportedLocale => {
    const formattedLocale = locale ? locale.replace('-', '_') : null;
    const supportedLocale = SUPPORTED_LOCALES.includes(formattedLocale as PayPalSupportedLocale) ? formattedLocale : null;
    return supportedLocale as PayPalSupportedLocale;
};
