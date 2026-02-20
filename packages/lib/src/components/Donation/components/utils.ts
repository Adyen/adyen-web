import Language from '../../../language';
import type { DonationAmount } from './types';
import type { DonationConfiguration } from '../types';
import type { ICore } from '../../../core/types';
import type DonationElement from '../Donation';
import DonationCampaignProvider, { DonationCampaignProviderProps } from '../DonationCampaignProvider2';

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
    const DonationClass = core.getComponent(txVariant) as typeof DonationElement | undefined;
    if (!DonationClass) {
        return null;
    }
    return new DonationClass(core, configProps);
}

export function getDonationCampaignProvider(txVariant: string, core: ICore, configProps: DonationCampaignProviderProps) {
    const DonationClass = core.getComponent(txVariant) as typeof DonationCampaignProvider | undefined;
    if (!DonationClass) {
        return null;
    }
    return new DonationClass(core, configProps);
}
