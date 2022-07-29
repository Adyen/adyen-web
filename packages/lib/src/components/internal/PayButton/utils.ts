import Language from '../../../language';
import { PaymentAmount } from '../../../types';

const amountLabel = (i18n, amount: PaymentAmount) => (!!amount?.value && !!amount?.currency ? i18n.amount(amount.value, amount.currency) : '');

const payAmountLabel = (i18n: Language, amount: PaymentAmount) => `${i18n.get('payButton')} ${amountLabel(i18n, amount)}`;

export { payAmountLabel, amountLabel };
