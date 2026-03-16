import type DonationCampaignProvider from './DonationCampaignProvider';
import type { DonationCampaignProviderAPI } from './types';

/**
 * Explicitly expose which methods can be used by the merchant
 * @param provider
 */
export const toDonationCampaignProviderAPI = (provider: DonationCampaignProvider): DonationCampaignProviderAPI => ({
    get rootNode() {
        return provider.rootNode;
    },
    set rootNode(node: HTMLElement | string) {
        provider.rootNode = node;
    },
    haltAutoStart() {
        provider.haltAutoStart();
    },
    start() {
        provider.start();
    }
});
