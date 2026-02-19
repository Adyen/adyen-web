import type { DonationCampaign, SessionsDonationCampaign } from './types';
import type { Donation } from './components/types';

/**
 * A DonationCampaign returned from the /sessions/donationCampaigns endpoint has a "sessionsDonation" property rather than the usual "donation property".
 * This function normalizes the DonationCampaign to always have a donation property.
 */
export function normalizeDonationCampaign(rawDonationCampaign: unknown): DonationCampaign {
    if (!rawDonationCampaign || typeof rawDonationCampaign !== 'object') {
        throw new Error('Donation campaign is missing');
    }

    const campaign = rawDonationCampaign as SessionsDonationCampaign;
    const donation: Donation = campaign.donation ?? campaign.sessionsDonation;

    if (!donation) {
        throw new Error('Donation campaign is missing donation details');
    }

    return {
        ...campaign,
        donation
    };
}
