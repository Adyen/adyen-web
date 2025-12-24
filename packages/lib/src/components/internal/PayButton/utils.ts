import Language from '../../../language';
import { PaymentAmount } from '../../../types/global-types';

export const PAY_BTN_DIVIDER = '/ ';

const amountLabel = (i18n, amount: PaymentAmount) =>
    !!amount?.value && !!amount?.currency ? i18n.amount(amount.value, amount.currency, { currencyDisplay: amount.currencyDisplay || 'symbol' }) : '';

const payAmountLabel = (i18n: Language, amount: PaymentAmount) => `${i18n.get('payButton')} ${amountLabel(i18n, amount)}`;

const secondaryAmountLabel = (i18n: Language, secondaryAmount: PaymentAmount) => {
    const convertedSecondaryAmount =
        secondaryAmount && !!secondaryAmount?.value && !!secondaryAmount?.currency
            ? i18n.amount(secondaryAmount.value, secondaryAmount.currency, { currencyDisplay: secondaryAmount.currencyDisplay || 'symbol' })
            : '';

    const divider = convertedSecondaryAmount.length ? PAY_BTN_DIVIDER : '';

    return `${divider}${convertedSecondaryAmount}`;
};

export { payAmountLabel, amountLabel, secondaryAmountLabel };
