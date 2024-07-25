import Language from '../../../language';
import { DonationAmount } from './types';

interface RoundupAmount {
    maxRoundupAmount: number;
    commercialTxAmount: number;
    currency: string;
}

const getRoundupAmount = (maxRoundupAmount: number, commercialTxAmount: number) => maxRoundupAmount - (commercialTxAmount % maxRoundupAmount);

const getAmountLabel = (i18n: Language, { value, currency }: DonationAmount) => i18n.amount(value, currency);

const getRoundupAmountLabel = (i18n: Language, { maxRoundupAmount, commercialTxAmount, currency }: RoundupAmount) =>
    getAmountLabel(i18n, { value: getRoundupAmount(maxRoundupAmount, commercialTxAmount), currency });

export { getAmountLabel, getRoundupAmount, getRoundupAmountLabel };
