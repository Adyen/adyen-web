import { SUPPORTED_LOCALES_PAYPAL_V5, SUPPORTED_LOCALES_PAYPAL_V6 } from '../config';
import type { PayPalV5SupportedLocale, PayPalV6SupportedLocale } from './types';

/**
 * Returns either a locale supported by PayPal or null, in order to let the PayPal SDK auto-detect the shopper locale.
 */
export const getSupportedLocalePayPalV5 = (locale: string): PayPalV5SupportedLocale => {
    const formattedLocale = locale ? locale.replace('-', '_') : null;
    const supportedLocale = SUPPORTED_LOCALES_PAYPAL_V5.includes(formattedLocale as PayPalV5SupportedLocale) ? formattedLocale : null;
    return supportedLocale as PayPalV5SupportedLocale;
};

/**
 * Returns either a locale supported by PayPal or null, in order to let the PayPal SDK auto-detect the shopper locale.
 */
export const getSupportedLocalePayPalV6 = (locale: string): PayPalV6SupportedLocale => {
    const formattedLocale = locale ? locale.replace('_', '-') : null;
    const supportedLocale = SUPPORTED_LOCALES_PAYPAL_V6.includes(formattedLocale as PayPalV6SupportedLocale) ? formattedLocale : null;
    return supportedLocale as PayPalV6SupportedLocale;
};
