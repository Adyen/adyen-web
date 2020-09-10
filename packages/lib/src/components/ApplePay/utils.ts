import { ApplePayElementProps } from './types';
import { PaymentAmount } from '../../types';

/**
 * @internal
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

export function resolveSupportedVersion(latestVersion) {
    const versions = [];
    for (let i = latestVersion; i > 0; i--) {
        versions.push(i);
    }

    return versions.find(v => v && window.ApplePaySession && ApplePaySession.supportsVersion(v));
}
