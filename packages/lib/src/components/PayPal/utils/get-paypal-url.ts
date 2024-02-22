import { getPaypalSettings } from './get-paypal-settings';
import { PAYPAL_JS_URL } from '../config';
import type { PayPalComponentProps } from '../types';

/**
 * Returns the PayPal SDK script URL with query parameters
 * @see {@link https://developer.paypal.com/docs/checkout/reference/customize-sdk/}
 */
export const getPaypalUrl = (props: Partial<PayPalComponentProps>): string => {
    const settings = getPaypalSettings(props);
    const params = decodeURIComponent(
        Object.keys(settings)
            .map(key => `${key}=${settings[key]}`)
            .join('&')
    );
    return `${PAYPAL_JS_URL}?${params}`;
};
