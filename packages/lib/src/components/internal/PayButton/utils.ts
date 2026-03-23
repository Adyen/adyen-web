import Language from '../../../language';
import type { PaymentAmount } from '../../../types/global-types';

export const PAY_BTN_DIVIDER = '/ ';

const amountLabel = (i18n, amount: PaymentAmount) =>
    !!amount?.value && !!amount?.currency ? i18n.amount(amount.value, amount.currency, { currencyDisplay: amount.currencyDisplay || 'symbol' }) : '';

const isAmountFirstFormat = (i18n: Language): boolean => {
    const format = i18n.get('payAmountFormat');
    const tokenIndex = format.indexOf('%@');
    return tokenIndex >= 0 && format.substring(tokenIndex + 2).trim().length > 0;
};

const payAmountLabel = (i18n: Language, amount: PaymentAmount, secondaryAmount?: PaymentAmount) => {
    const amountLabelValue = amountLabel(i18n, amount);
    if (!amountLabelValue) {
        return i18n.get('payButton');
    }

    if (secondaryAmount && isAmountFirstFormat(i18n)) {
        const secondaryAmountValue = formatSecondaryAmountLabel(i18n, secondaryAmount);
        return i18n.get('payAmountFormat').replace('%@', `${amountLabelValue}${secondaryAmountValue}`);
    }

    return i18n.get('payAmountFormat').replace('%@', amountLabelValue);
};

const formatSecondaryAmountLabel = (i18n: Language, secondaryAmount: PaymentAmount) => {
    const convertedSecondaryAmount =
        secondaryAmount && !!secondaryAmount?.value && !!secondaryAmount?.currency
            ? i18n.amount(secondaryAmount.value, secondaryAmount.currency, { currencyDisplay: secondaryAmount.currencyDisplay || 'symbol' })
            : '';

    const divider = convertedSecondaryAmount.length ? PAY_BTN_DIVIDER : '';

    return `${divider}${convertedSecondaryAmount}`;
};

function createButtonLabel(
    i18n: Language,
    customLabel: string,
    amount: PaymentAmount,
    isZeroAuth: boolean,
    customAmount?: PaymentAmount,
    secondaryAmount?: PaymentAmount
): string {
    if (customLabel) {
        return customLabel;
    }

    if (customAmount) {
        return payAmountLabel(i18n, customAmount);
    }

    return isZeroAuth ? i18n.get('confirmPreauthorization') : payAmountLabel(i18n, amount, secondaryAmount);
}

/**
 * Show the secondaryLabel if:
 *  - it's not zero auth, and
 *  - we don't have a predefined label (i.e. redirect, qrcode, await based comps...), and
 *  - we do have an amount object (merchant might not be passing this in order to not show the amount on the button), and
 *  - we have a secondaryAmount object with some properties, and
 *  - the payAmountFormat is not amount-first (e.g. "%@ betalen"), since in that case the secondary
 *    amount is already embedded in the button label via createButtonLabel
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

    if (isAmountFirstFormat(i18n)) {
        return null;
    }

    return formatSecondaryAmountLabel(i18n, secondaryAmount);
}

export { payAmountLabel, amountLabel, createButtonLabel, createSecondaryLabel };
