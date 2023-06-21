import Language from '../../../language';
import { PaymentAmountExtended } from '../../../types';

export const PAY_BTN_DIVIDER = ' / ';

const amountLabel = (i18n: Language, amount: PaymentAmountExtended) =>
    !amount?.hideAmountLabel && !!amount?.value && !!amount?.currency
        ? i18n.amount(amount.value, amount.currency, { currencyDisplay: amount.currencyDisplay || 'symbol' })
        : '';

const payAmountLabel = (i18n: Language, amount: PaymentAmountExtended) => `${i18n.get('payButton')} ${amountLabel(i18n, amount)}`.trimEnd();

const secondaryAmountLabel = (i18n: Language, secondaryAmount: PaymentAmountExtended) => {
    const convertedSecondaryAmount =
        secondaryAmount && !secondaryAmount.hideAmountLabel && !!secondaryAmount.value && !!secondaryAmount.currency
            ? i18n.amount(secondaryAmount.value, secondaryAmount.currency, { currencyDisplay: secondaryAmount.currencyDisplay || 'symbol' })
            : '';

    const divider = convertedSecondaryAmount.length ? PAY_BTN_DIVIDER : '';

    return `${divider}${convertedSecondaryAmount}`;
};

export { payAmountLabel, amountLabel, secondaryAmountLabel };
