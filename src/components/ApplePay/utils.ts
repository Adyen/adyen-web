import { ApplePayElementProps } from '~/components/ApplePay/types';
import { PaymentAmount } from '../../types';

/**
 * @private
 * Gets an amount value from an amount object or defaults to an amount property.
 */
export function normalizeAmount(props: ApplePayElementProps): PaymentAmount {
    if (typeof props.amount?.value !== 'undefined' && props.amount?.currency) {
        return props.amount;
    } else if (typeof props.amount === 'number' && props.currencyCode) {
        return { value: props.amount, currency: props.currencyCode };
    }

    return null;
}
