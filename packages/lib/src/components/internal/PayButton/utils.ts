import Language from '../../../language';
import type { PaymentAmount } from '../../../types/global-types';

export const PAY_BTN_DIVIDER = '/ ';

const amountLabel = (i18n, amount: PaymentAmount) =>
    !!amount?.value && !!amount?.currency ? i18n.amount(amount.value, amount.currency, { currencyDisplay: amount.currencyDisplay || 'symbol' }) : '';

const payAmountLabel = (i18n: Language, amount: PaymentAmount) => `${i18n.get('payButton')} ${amountLabel(i18n, amount)}`;

const formatSecondaryAmountLabel = (i18n: Language, secondaryAmount: PaymentAmount) => {
    const convertedSecondaryAmount =
        secondaryAmount && !!secondaryAmount?.value && !!secondaryAmount?.currency
            ? i18n.amount(secondaryAmount.value, secondaryAmount.currency, { currencyDisplay: secondaryAmount.currencyDisplay || 'symbol' })
            : '';

    const divider = convertedSecondaryAmount.length ? PAY_BTN_DIVIDER : '';

    return `${divider}${convertedSecondaryAmount}`;
};

function createButtonLabel(i18n: Language, customLabel: string, amount: PaymentAmount, isZeroAuth: boolean, customAmount?: PaymentAmount): string {
    if (customLabel) {
        return customLabel;
    }

    if (customAmount) {
        return payAmountLabel(i18n, customAmount);
    }

    return isZeroAuth ? i18n.get('confirmPreauthorization') : payAmountLabel(i18n, amount);
}

/**
 * Show the secondaryLabel if:
 *  - it's not zero auth, and
 *  - we don't have a predefined label (i.e. redirect, qrcode, await based comps...), and
 *  - we do have an amount object (merchant might not be passing this in order to not show the amount on the button), and
 *  - we have a secondaryAmount object with some properties
 */
function createSecondaryLabel(
    i18n: Language,
    secondaryAmount: PaymentAmount,
    isAmountValid: boolean,
    isZeroAuth: boolean,
    customLabel: string
): string | null {
    if (isZeroAuth || customLabel || !isAmountValid || !secondaryAmount) {
        return null;
    }
    return formatSecondaryAmountLabel(i18n, secondaryAmount);
}

export { payAmountLabel, amountLabel, createButtonLabel, createSecondaryLabel };
