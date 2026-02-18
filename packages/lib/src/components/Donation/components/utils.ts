import Language from '../../../language';
import { DonationAmount } from './types';
import { ICore } from '../../../core/types';
import { DonationConfiguration } from '../types';
import Donation from '../Donation';

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

export function getDonationComponent(txVariant: string, core: ICore, configProps: DonationConfiguration) {
    const DonationClass = core.getComponent(txVariant) as typeof Donation | undefined;
    if (!DonationClass) {
        return null;
    }
    return new DonationClass(core, configProps);
}
