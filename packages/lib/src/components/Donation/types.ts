import type { UIElementProps } from '../internal/UIElement/types';
import DonationElement from './Donation';
import type { Donation, DonationComponentProps, DonationPayload } from './components/types';
import type { CampaignContentProps } from './components/CampaignContent';

export type DonationConfiguration = UIElementProps &
    Omit<DonationComponentProps, 'onDonate' | 'onCancel'> & {
        onDonate(data: DonationPayload, component: DonationElement): void; // TODO original onDoante can have a 2nd, component, arg
        onCancel(data: DonationPayload): void;
    };

export interface DonationCampaign extends CampaignContentProps {
    id: string;
    campaignName: string;
    donation: Donation;
    termsAndConditionsUrl?: string;
}

export interface DonationCampaignProviderAPI {
    get rootNode(): HTMLElement | string;
    set rootNode(node: HTMLElement | string);

    haltAutoStart(): void;
    start(): void;
}

export interface DonationOptions {
    autoStart: boolean;
    delay: number;
    /**
     * Optional callback when the (sessions) donation is completed (or cancelled)
     * @param didDonate - a boolean staing whether a donation was made (true) or whether the shopper cancelled the donation (false)
     */
    onSuccess?: (didDonate: boolean) => void;
    /**
     * Optional callback when the (sessions) donation fails
     * @param reason - the reason why the donation failed (could be an error message; or a string, stating for example, that the donation payment was refused)
     */
    onError?: (reason: unknown) => void;
}

export interface DonationCampaignOptions {
    rootNode: HTMLElement | string;
    commercialTxAmount: number;
}

/**
 * Props for service mode - component will fetch campaign data via DonationCampaignService.
 * Discriminated by the presence of `mode: 'service'`.
 */
export interface DonationServiceProps {
    mode: 'service';
    options: DonationCampaignOptions;
}

/**
 * Union type for Donation component instantiation.
 * - DonationConfiguration: Direct mode (backward compatible) - campaign data already available
 * - DonationServiceProps: Service mode - component fetches campaign data
 */
export type DonationProps = DonationConfiguration | DonationServiceProps;
