import { CampaignContentProps } from './CampaignContent';
import { Signal } from '@preact/signals';

interface DonationAmounts {
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
    amounts: DonationAmounts;
    termsAndConditionsUrl?: string;
    causeName?: string;
    showCancelButton?: boolean;
    status?: Signal<string>;
    onDonate: (payload: DonationPayload) => void;
    onCancel?: (payload: DonationPayload) => void;
    onChange?: (payload: DonationPayload) => void;
}
