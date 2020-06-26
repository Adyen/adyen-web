/**
 * @internal
 * Gets an amount value from an amount object or defaults to an amount property.
 */
import { ApplePayElementProps } from '~/components/ApplePay/types';

export function normalizeAmount(props: ApplePayElementProps): number {
    if (typeof props.amount === 'object' && {}.hasOwnProperty.call(props.amount, 'value')) {
        return props.amount.value;
    }

    return props.amount as number;
}

/**
 * @internal
 * Gets a currencyCode from an amount object or defaults to a currencyCode property.
 */
export function normalizeCurrency(props: ApplePayElementProps): string {
    if (typeof props.amount === 'object' && {}.hasOwnProperty.call(props.amount, 'currency')) {
        return props.amount.currency;
    }

    return props.currencyCode;
}
