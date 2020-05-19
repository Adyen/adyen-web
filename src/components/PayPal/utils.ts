import { ADYEN_CLIENTID_TEST, ADYEN_CLIENTID_LIVE, INTEGRATION_DATE, PAYPAL_JS_URL } from './config';
import { PaypalSettingsProps, PaypalSettings } from './types';

const getPaypalSettings = ({ amount, countryCode, environment = '', intent, locale, merchantId }: PaypalSettingsProps): PaypalSettings => {
    const shopperLocale: string = locale ? locale.replace('-', '_') : null;
    const currency: string = amount ? amount.currency : null;
    const isTestEnvironment: boolean = environment.toLowerCase() === 'test';
    const clientId: string = isTestEnvironment ? ADYEN_CLIENTID_TEST : ADYEN_CLIENTID_LIVE;

    return {
        ...(merchantId && { 'merchant-id': merchantId }),
        ...(shopperLocale && { locale: shopperLocale }),
        ...(countryCode && isTestEnvironment && { 'buyer-country': countryCode }),
        ...(currency && { currency }),
        ...(intent && { intent }),
        'client-id': clientId,
        'integration-date': INTEGRATION_DATE,
        components: 'buttons,funding-eligibility'
    };
};

const getPayPalParams = props => {
    const settings = getPaypalSettings(props);
    const params = [];

    Object.keys(settings).forEach(name => {
        const value = decodeURIComponent(settings[name]);
        params.push(`${name}=${value}`);
    });

    return params.join('&');
};

const getPaypalUrl = props => {
    const params = getPayPalParams(props);
    return `${PAYPAL_JS_URL}?${params}`;
};

export { getPaypalSettings, getPaypalUrl };
