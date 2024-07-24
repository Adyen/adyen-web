import { getSupportedLocale } from './get-paypal-locale';
import { ADYEN_CLIENTID_LIVE, ADYEN_CLIENTID_TEST, INTEGRATION_DATE } from '../config';
import type { PaypalSettings, PayPalSupportedLocale } from './types';
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
