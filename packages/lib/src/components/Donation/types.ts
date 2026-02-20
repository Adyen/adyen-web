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

export interface SessionsDonationCampaign extends Omit<DonationCampaign, 'donation'> {
    donation?: DonationCampaign['donation'];
    sessionsDonation?: DonationCampaign['donation'];
}
