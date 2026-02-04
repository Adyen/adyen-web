import { TxVariants } from '../tx-variants';
import { CardConfiguration, UIElementProps, UPIConfiguration } from '../types';

export interface EMIConfiguration extends UIElementProps {
    fundingSourceConfiguration: {
        card: CardConfiguration;
        upi: UPIConfiguration;
    };
}

export enum EMIFundingSource {
    CARD = TxVariants.card,
    UPI = TxVariants.upi
}

export interface EMIOfferFormData {
    provider: string;
    discount: string;
    plan: string;
}
