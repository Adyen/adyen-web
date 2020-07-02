import fetchJSONData from '~/utils/fetch-json-data';
import { AMAZON_SIGNATURE_ENDPOINT, FALLBACK_LOCALE_PER_REGION, SUPPORTED_LOCALES_PER_REGION } from './config';
import { DeliverySpecifications, PayloadJSON, Region, SupportedLocale } from '~/components/AmazonPay/types';

/**
 * Processes the region to create the AmazonPay script URL with the right suffix.
 * @param region - Two-letter country code in ISO 3166 format
 * @returns The AmazonPay script URL with the right region suffix
 */
export function getAmazonPayUrl(region: Region): string {
    const suffix = region.toLowerCase() === 'us' ? 'na' : 'eu';
    return `https://static-${suffix}.payments-amazon.com/checkout.js`;
}

/**
 * Makes a call to the Amazon Signature endpoint, passing the PayloadJSON string.
 * @param loadingContext - Loading context to be used in the call
 * @param payloadJSON - Object to be signed
 * @param accessKey - Access key to be used as a public token
 * @returns A promise containing the response of the call
 */
export function getAmazonSignature(loadingContext: string, payloadJSON: PayloadJSON, accessKey: string): Promise<any> {
    const options = {
        loadingContext,
        method: 'POST',
        path: `${AMAZON_SIGNATURE_ENDPOINT}?token=${accessKey}`
    };

    return fetchJSONData(options, payloadJSON);
}

/**
 * Gets a locale and matches it with one of the supported locales for the given region.
 * If there's no match, it will return the region's fallback option.
 * @param locale - Locale to be processed
 * @param region - Two-letter country code in ISO 3166 format
 * @returns A supported locale
 */
export function getCheckoutLocale(locale: string, region: Region): SupportedLocale {
    const formattedLocale = locale.replace('-', '_');
    const formattedRegion = region.toLowerCase() === 'us' ? 'us' : 'eu';
    const supportedLocales = SUPPORTED_LOCALES_PER_REGION[formattedRegion];
    const isSupportedLocale = supportedLocales.includes(formattedLocale);
    const checkoutLocale = isSupportedLocale ? formattedLocale : FALLBACK_LOCALE_PER_REGION[formattedRegion];

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
