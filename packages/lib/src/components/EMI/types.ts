import { TxVariants } from '../tx-variants';
import { CardConfiguration, UIElementProps, UPIConfiguration } from '../types';
import type { EMIDetailItem, EMIOffer, EMIPaymentMethodData } from './offers/types';
import type { SelectItem } from '../internal/FormFields/Select/types';

export interface EMIOffersData {
    providers: SelectItem[];
    discounts: SelectItem[];
    plans: SelectItem[];
    rawOffers?: EMIOffer[];
    rawDetails?: EMIDetailItem[];
}

export interface EMIConfiguration extends UIElementProps {
    fundingSourceConfiguration?: {
        card?: CardConfiguration;
        upi?: UPIConfiguration;
    };
    emiPaymentMethodData?: EMIPaymentMethodData;
    offersData?: EMIOffersData;
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
