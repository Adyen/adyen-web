import { ADYEN_CLIENTID_TEST, ADYEN_CLIENTID_LIVE, INTEGRATION_DATE, PAYPAL_JS_URL, SUPPORTED_LOCALES, SUPPORTED_COLORS_FOR_CREDIT } from './config';
import { PaypalSettings, PayPalSupportedLocale, FundingSource, PayPalComponentProps } from './types';

/**
 * Processes and returns a new style object.
 */
const getStyle = (fundingSource: FundingSource, style = {}) => {
    if (fundingSource === 'paypal') return { ...style };

    return Object.keys(style).reduce((acc, prop) => {
        const value = style[prop];
        if (prop !== 'color' || SUPPORTED_COLORS_FOR_CREDIT.includes(value)) {
            acc[prop] = value;
        }
        return acc;
    }, {});
};

/**
 * Returns either a locale supported by PayPal or null, in order to let the PayPal SDK auto-detect the shopper locale.
 */
const getSupportedLocale = (locale: string): PayPalSupportedLocale => {
    const formattedLocale = locale ? locale.replace('-', '_') : null;
    const supportedLocale = SUPPORTED_LOCALES.includes(formattedLocale as PayPalSupportedLocale) ? formattedLocale : null;
    return supportedLocale as PayPalSupportedLocale;
};

/**
 * Returns an object of settings for the PayPal SDK
 */
const getPaypalSettings = ({
    amount,
    countryCode,
    debug,
    environment = '',
    locale,
    configuration,
    commit,
    vault,
    enableMessages
}: Partial<PayPalComponentProps>): PaypalSettings => {
    const shopperLocale: PayPalSupportedLocale = getSupportedLocale(locale);
    const currency: string = amount ? amount.currency : null;
    const isTestEnvironment: boolean = environment.toLowerCase() === 'test';
    const clientId: string = isTestEnvironment ? ADYEN_CLIENTID_TEST : ADYEN_CLIENTID_LIVE;
    const { merchantId, intent } = configuration;
    const components = `buttons,funding-eligibility${enableMessages ? ',messages' : ''}`;

    return {
        ...(merchantId && { 'merchant-id': merchantId }),
        ...(shopperLocale && { locale: shopperLocale }),
        ...(countryCode && isTestEnvironment && { 'buyer-country': countryCode }),
        ...(debug && isTestEnvironment && { debug }),
        ...(currency && { currency }),
        ...(intent && { intent }),
        commit,
        vault,
        'client-id': clientId,
        'integration-date': INTEGRATION_DATE,
        'enable-funding': 'paylater,venmo',
        components
    };
};

/**
 * Returns the PayPal SDK script URL with query parameters
 * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/}
 */
const getPaypalUrl = (props: Partial<PayPalComponentProps>): string => {
    const settings = getPaypalSettings(props);
    const params = decodeURIComponent(
        Object.keys(settings)
            .map(key => `${key}=${settings[key]}`)
            .join('&')
    );
    return `${PAYPAL_JS_URL}?${params}`;
};

export { getStyle, getSupportedLocale, getPaypalUrl };
