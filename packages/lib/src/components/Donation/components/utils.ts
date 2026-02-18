import Language from '../../../language';
import { DonationAmount, type DonationCampaign, SessionsDonationCampaign } from './types';
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

/**
 * A DonationCampaign returned from the /sessions/donationCampaigns endpoint has a "sessionsDonation" property rather than the usual "donation property".
 * This function normalizes the DonationCampaign to always have a donation property.
 */
export function normalizeDonationCampaign(rawDonationCampaign: unknown): DonationCampaign {
    if (!rawDonationCampaign || typeof rawDonationCampaign !== 'object') {
        throw new Error('Donation campaign is missing');
    }

    const campaign = rawDonationCampaign as SessionsDonationCampaign;
    const donation = campaign.donation ?? campaign.sessionsDonation;

    if (!donation) {
        throw new Error('Donation campaign is missing donation details');
    }

    return {
        ...campaign,
        donation
    };
}
