import { CampaignContentProps } from './CampaignContent';

interface DonationAmounts {
    currency: string;
    values: Array<number>;
}
interface DonationAmount {
    currency: string;
    value: number;
}
interface DonationPayload {
    data: { amount: DonationAmount };
    isValid?: boolean;
}

export interface DonationComponentProps extends CampaignContentProps {
    amounts: DonationAmounts;
    termsAndConditionsUrl?: string;
    causeName?: string;
    showCancelButton?: boolean;
    onDonate: (payload: DonationPayload) => void;
    onCancel?: (payload: DonationPayload) => void;
    onChange?: (payload: DonationPayload) => void;
}
