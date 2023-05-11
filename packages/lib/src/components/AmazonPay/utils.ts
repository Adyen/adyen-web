import {
    AMAZONPAY_URL_EU,
    AMAZONPAY_URL_US,
    FALLBACK_LOCALE_EU,
    FALLBACK_LOCALE_US,
    LEDGER_CURRENCIES_PER_REGION,
    SUPPORTED_LOCALES_EU,
    SUPPORTED_LOCALES_US
} from './config';
import { AmazonPayButtonProps, AmazonPayButtonSettings, ChargeAmount, Currency, PayloadJSON, Region, SupportedLocale } from './types';
import { PaymentAmount } from '../../types';
import { getDecimalAmount } from '../../utils/amount-util';

/**
 * Returns the AmazonPay script URL for passed region.
 * @param region - Two-letter country code in ISO 3166 format
 * @returns the AmazonPay script URL
 */
export function getAmazonPayUrl(region: Region): string {
    return region === 'US' ? AMAZONPAY_URL_US : AMAZONPAY_URL_EU;
}

/**
 * Returns the AmazonPay button settings object
 * @param props -
 * @returns the AmazonPay button settings
 */
export function getAmazonPaySettings(props: AmazonPayButtonProps): AmazonPayButtonSettings {
    return {
        ...(props.buttonColor && { buttonColor: props.buttonColor }),
        ...(props.design && { design: getDesignCode(props.design) }),
        checkoutLanguage: getCheckoutLocale(props.locale, props.configuration.region),
        ledgerCurrency: LEDGER_CURRENCIES_PER_REGION[props.configuration.region] || props.currency || (props.amount?.currency as Currency),
        merchantId: props.configuration.merchantId,
        productType: props.productType,
        placement: props.placement,
        sandbox: props.environment === 'TEST'
    };
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
    return supportedLocales as unknown as SupportedLocale[];
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
    const checkoutLocale = isSupportedLocale ? locale : getFallbackLocale(region);

    return checkoutLocale as SupportedLocale;
}

/**
 * Gets the design code from the given alias.
 * @param design - The alias of one of the possible designs.
 * @returns A design code
 */
export function getDesignCode(design: string): string {
    if (design === 'noTagline') return 'C0001';
    return null;
}

/**
 * Returns the amount in the format Amazon expects.
 * @param amount - The amount object in the Adyen format
 * @returns the charge amount object in the Amazon format
 */
export function getChargeAmount(amount: PaymentAmount): ChargeAmount {
    return {
        amount: String(getDecimalAmount(amount.value, amount.currency)),
        currencyCode: amount.currency as Currency
    };
}

/**
 * Returns a PayloadJSON object.
 * @param props -
 * @returns PayloadJSON
 */
export function getPayloadJSON(props): PayloadJSON {
    const { addressDetails, cancelUrl, checkoutMode, deliverySpecifications, returnUrl, merchantMetadata, chargePermissionType, recurringMetadata } =
        props;

    const { storeId } = props.configuration;
    const isPayNow = checkoutMode === 'ProcessOrder';
    const amount = isPayNow ? getChargeAmount(props.amount) : null;

    return {
        storeId,
        chargePermissionType,
        webCheckoutDetails: {
            ...(isPayNow ? { checkoutResultReturnUrl: returnUrl } : { checkoutReviewReturnUrl: returnUrl }),
            ...(cancelUrl && { checkoutCancelUrl: cancelUrl }),
            ...(isPayNow && { checkoutMode })
        },
        ...(isPayNow && {
            paymentDetails: {
                chargeAmount: amount,
                paymentIntent: 'Confirm',
                presentmentCurrency: amount.currencyCode,
                totalOrderAmount: amount
            }
        }),
        ...(recurringMetadata && { recurringMetadata }),
        ...(merchantMetadata && { merchantMetadata }),
        ...(deliverySpecifications && { deliverySpecifications }),
        ...(addressDetails && { addressDetails })
    };
}
