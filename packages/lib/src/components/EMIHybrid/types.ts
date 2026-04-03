import type { HybridUIElementProps } from '../internal/HybridUIElement';
import type { CardConfiguration } from '../Card/types';
import type { UPIConfiguration } from '../UPI/types';
import type { PaymentAmount } from '../../types/global-types';
import { TxVariants } from '../tx-variants';

export enum EMIHybridFundingSource {
    CARD = TxVariants.card,
    UPI = TxVariants.upi
}

export interface EMIHybridConfiguration extends HybridUIElementProps {
    fundingSourceConfiguration?: {
        card?: Partial<CardConfiguration>;
        upi?: Partial<UPIConfiguration>;
    };
    amount?: PaymentAmount;
}

export interface EMIHybridPaymentData {
    paymentMethod: {
        type: string;
        fundingSource?: any;
        [key: string]: any;
    };
    origin?: string;
    browserInfo?: any;
    billingAddress?: any;
}
