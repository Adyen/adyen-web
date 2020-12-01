import { AMAZONPAY_URL_EU, AMAZONPAY_URL_US, FALLBACK_LOCALE_EU, FALLBACK_LOCALE_US, SUPPORTED_LOCALES_EU, SUPPORTED_LOCALES_US } from './config';
import { DeliverySpecifications, PayloadJSON, Region, SupportedLocale } from './types';

/**
 * Returns the AmazonPay script URL for passed region.
 * @param region - Two-letter country code in ISO 3166 format
 * @returns the AmazonPay script URL
 */
export function getAmazonPayUrl(region: Region): string {
    return region === 'US' ? AMAZONPAY_URL_US : AMAZONPAY_URL_EU;
}

/**
 * Returns the fallback locale for passed region.
 * @param region - Two-letter country code in ISO 3166 format
 * @returns A fallback locale
 */
export function getFallbackLocale(region: Region): SupportedLocale {
    return region === 'US' ? FALLBACK_LOCALE_US : FALLBACK_LOCALE_EU;
}

/**
 * Returns an array of supported locales for passed region.
 * @param region - Two-letter country code in ISO 3166 format
 * @returns An array of supported locales
 */
export function getSupportedLocales(region: Region): SupportedLocale[] {
    const supportedLocales = region === 'US' ? SUPPORTED_LOCALES_US : SUPPORTED_LOCALES_EU;
    return (supportedLocales as unknown) as SupportedLocale[];
}

/**
 * Gets a locale and matches it with one of the supported locales for the given region.
 * If there's no match, it will return the region's fallback option.
 * @param locale - Locale to be processed
 * @param region - Two-letter country code in ISO 3166 format
 * @returns A supported locale
 */
export function getCheckoutLocale(locale: string, region: Region): SupportedLocale {
    const supportedLocales = getSupportedLocales(region);
    const isSupportedLocale = supportedLocales.includes(locale as SupportedLocale);
    const fallbackLocale = getFallbackLocale(region);
    const checkoutLocale = isSupportedLocale ? locale : fallbackLocale;

    return checkoutLocale as SupportedLocale;
}

/**
 * Returns a PayloadJSON object.
 * @param storeId - Store ID from the merchant
 * @param returnUrl - Return URL to be used as checkoutReviewReturnUrl
 * @param deliverySpecifications - Optional delivery specifications object
 * @returns PayloadJSON
 */
export function getPayloadJSON(storeId: string, returnUrl: string, deliverySpecifications?: DeliverySpecifications): PayloadJSON {
    return {
        storeId,
        webCheckoutDetails: {
            checkoutReviewReturnUrl: returnUrl
        },
        ...(deliverySpecifications && { deliverySpecifications })
    };
}
