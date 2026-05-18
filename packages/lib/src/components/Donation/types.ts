import type { UIElementProps } from '../internal/UIElement/types';
import DonationElement from './Donation';
import type { Donation, DonationComponentProps, DonationPayload } from './components/types';
import type { CampaignContentProps } from './components/CampaignContent';

export type DonationConfiguration = UIElementProps &
    Omit<DonationComponentProps, 'onDonate' | 'onCancel'> & {
        onDonate(data: DonationPayload, component: DonationElement): void;
        onCancel(data: DonationPayload): void;
    };

export interface DonationCampaign extends CampaignContentProps {
    id: string;
    campaignName: string;
    donation: Donation;
    termsAndConditionsUrl?: string;
}

export interface DonationOptions {
    /**
     * Optional boolean to delay, or halt, the showing of the Donation component when in the Sessions flow.
     * Defaults to true.
     */
    autoMount?: boolean;
    /**
     * Optional number representing the delay in milliseconds before the Donation component is mounted (if mandated by the /payments response in the Sessions flow),
     * Defaults to 3000.
     */
    delay?: number;
    /**
     * Callback when the (sessions) donation is completed (or cancelled)
     * @param didDonate - a boolean stating whether a donation was made (true) or whether the shopper cancelled the donation (false)
     */
    onDonationSuccess: (result: { didDonate: boolean }) => void;
    /**
     * Callback when the (sessions) donation fails
     * @param reason - the reason why the donation failed (could be an error message; or a string, stating for example, that the donation payment was refused)
     */
    onDonationFailure: (reason: unknown) => void;
}

export interface DonationCampaignOptions {
    rootNode: HTMLElement | string;
    commercialTxAmount: number;
}

/**
 * Union type for Donation component instantiation.
 * - DonationConfiguration: Direct mode (backward compatible) - campaign data already available
 * - DonationCampaignOptions: Service mode - component fetches campaign data
 */
export type DonationProps = DonationConfiguration | DonationCampaignOptions;
