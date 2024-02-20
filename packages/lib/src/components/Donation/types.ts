import { DonationAmounts, DonationComponentProps, DonationPayload } from './components/types';

export interface NewDonationComponentProps {
    amounts: DonationAmounts;
    bannerUrl: string;
    logoUrl: string;
    nonprofitDescription: string;
    nonprofitName: string;
    nonprofitUrl: string;
    termsAndConditionsUrl: string;
    causeName?: string;
    showCancelButton?: boolean;
    onDonate: (payload: DonationPayload) => void;
    onCancel?: (payload: DonationPayload) => void;
    onChange?: (payload: DonationPayload) => void;
}

export type DonationElementProps = NewDonationComponentProps | DonationComponentProps;
