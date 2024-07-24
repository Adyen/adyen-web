import { CampaignContentProps } from './CampaignContent';

type Donation = RoundupDonation | FixedAmountsDonation;

export type Status = 'ready' | 'error' | 'loading' | 'success';

export interface RoundupDonation {
    type: 'roundup';
    currency: string;
    maxRoundupAmount: number;
}

export interface FixedAmountsDonation {
    type: 'fixedAmounts';
    currency: string;
    values: Array<number>;
}

export interface DonationAmount {
    currency: string;
    value: number;
}

export interface DonationPayload {
    data: { amount: DonationAmount };
    isValid?: boolean;
}

export interface DonationComponentProps extends CampaignContentProps {
    donation: Donation;
    /**
     * The original transaction amount.
     */
    commercialTxAmount: number;
    termsAndConditionsUrl?: string;
    causeName?: string;
    showCancelButton?: boolean;
    onDonate: (payload: DonationPayload) => void;
    onCancel?: (payload: DonationPayload) => void;
    onChange?: (payload: DonationPayload) => void;
}
