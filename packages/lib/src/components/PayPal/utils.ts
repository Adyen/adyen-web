import { ADYEN_CLIENTID_TEST, ADYEN_CLIENTID_LIVE, INTEGRATION_DATE, PAYPAL_JS_URL, SUPPORTED_LOCALES } from './config';
import { PaypalSettings, SupportedLocale, PayPalElementProps } from './types';

/**
 * Returns either a locale supported by PayPal or null, in order to let the PayPal SDK auto-detect the shopper locale.
 */
const getSupportedLocale = (locale?: string): SupportedLocale => {
    const formattedLocale = locale ? locale.replace('-', '_') : null;
    const supportedLocale = SUPPORTED_LOCALES.includes(formattedLocale as SupportedLocale) ? formattedLocale : null;
    return supportedLocale as SupportedLocale;
};

/**
 * Returns an object of settings for the PayPal SDK
 */
const getPaypalSettings = ({ amount, countryCode, debug, environment = '', locale, configuration, commit }: PayPalElementProps): PaypalSettings => {
    const shopperLocale: SupportedLocale = getSupportedLocale(locale);
    const currency: string = amount ? amount.currency : null;
    const isTestEnvironment: boolean = environment.toLowerCase() === 'test';
    const clientId: string = isTestEnvironment ? ADYEN_CLIENTID_TEST : ADYEN_CLIENTID_LIVE;

    const { merchantId, intent } = configuration;

    return {
        ...(merchantId && { 'merchant-id': merchantId }),
        ...(shopperLocale && { locale: shopperLocale }),
        ...(countryCode && isTestEnvironment && { 'buyer-country': countryCode }),
        ...(debug && isTestEnvironment && { debug }),
        ...(currency && { currency }),
        ...(intent && { intent }),
        ...{ commit },
        'client-id': clientId,
        'integration-date': INTEGRATION_DATE,
        components: 'buttons,funding-eligibility'
    };
};

/**
 * Returns the PayPal SDK script URL with query parameters
 * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/}
 */
const getPaypalUrl = (props: PayPalElementProps): string => {
    const settings = getPaypalSettings(props);
    const params = decodeURIComponent(
        Object.keys(settings)
            .map(key => `${key}=${settings[key]}`)
            .join('&')
    );
    return `${PAYPAL_JS_URL}?${params}`;
};

export { getPaypalSettings, getPaypalUrl };
