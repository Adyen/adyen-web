import { getSupportedLocalePayPalV5 } from './get-paypal-locale';
import { ADYEN_CLIENTID_V5_LIVE, ADYEN_CLIENTID_V5_TEST, INTEGRATION_DATE } from '../config';
import type { PaypalSettings, PayPalV5SupportedLocale } from './types';
import type { PayPalComponentProps } from '../components/types';

/**
 * Returns an object of settings for the PayPal SDK
 */
export const getPaypalSettings = ({
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
    const shopperLocale: PayPalV5SupportedLocale = getSupportedLocalePayPalV5(locale);
    const currency: string = amount ? amount.currency : null;
    const isTestEnvironment: boolean = environment.toLowerCase() === 'test';
    const clientId: string = isTestEnvironment ? ADYEN_CLIENTID_V5_TEST : ADYEN_CLIENTID_V5_LIVE;
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
