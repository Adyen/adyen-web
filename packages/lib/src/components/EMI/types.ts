import type { UIElementProps } from '../internal/UIElement/types';
import type { CardConfiguration } from '../Card/types';
import { TxVariants } from '../tx-variants';

export enum EMIFundingSource {
    CARD = TxVariants.card
}

export interface SupportedPaymentMethod {
    type: string;
    name?: string;
    brands?: string[];
}

export interface EMIConfiguration extends UIElementProps {
    supportedPaymentMethods?: SupportedPaymentMethod[];
    fundingSourceConfiguration?: {
        card?: Partial<CardConfiguration>;
    };
}
