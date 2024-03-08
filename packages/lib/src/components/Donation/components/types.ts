import { DisclaimerMsgObject } from '../../internal/DisclaimerMessage/DisclaimerMessage';

export interface DonationAmounts {
    currency: string;
    values: Array<number>;
}

interface DonationAmount {
    currency: string;
    value: number;
}

export interface DonationPayload {
    data: { amount: DonationAmount };
    isValid?: boolean;
}

export interface DonationComponentProps {
    amounts: DonationAmounts;
    backgroundUrl?: string;
    description?: string;
    logoUrl?: string;
    name?: string;
    showCancelButton?: boolean;
    url?: string;
    disclaimerMessage?: DisclaimerMsgObject;
    onDonate: (payload: DonationPayload) => void;
    onCancel?: (payload: DonationPayload) => void;
    onChange?: (payload: DonationPayload) => void;
}
