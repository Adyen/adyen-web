import Language from '../../../language';
import { PaymentAmountExtended } from '../../../types';

const amountLabel = (i18n, amount: PaymentAmountExtended) =>
    !!amount?.value && !!amount?.currency ? i18n.amount(amount.value, amount.currency, { currencyDisplay: amount.currencyDisplay || 'symbol' }) : '';

const payAmountLabel = (i18n: Language, amount: PaymentAmountExtended) => `${i18n.get('payButton')} ${amountLabel(i18n, amount)}`;

const secondaryAmountLabel = (i18n: Language, secondaryAmount: PaymentAmountExtended) => {
    const convertedSecondaryAmount =
        secondaryAmount && !!secondaryAmount?.value && !!secondaryAmount?.currency
            ? i18n.amount(secondaryAmount.value, secondaryAmount.currency, { currencyDisplay: secondaryAmount.currencyDisplay || 'symbol' })
            : '';

    const divider = convertedSecondaryAmount.length ? '/ ' : '';

    return `${divider}${convertedSecondaryAmount}`;
};

export { payAmountLabel, amountLabel, secondaryAmountLabel };
