import type { UIElementProps } from '../internal/UIElement/types';
import type CardElement from '../Card';
import type { CardConfiguration, CardElementData } from '../Card/types';
import { TxVariants } from '../tx-variants';

export enum EMIFundingSource {
    CARD = TxVariants.card
}

/**
 * Payment elements EMI can delegate to. Each one must expose a public 'formatData()'
 */
export type EMIFundingSourceElement = CardElement;

export type EMIFundingSourceData = CardElementData;

export interface EMISupportedPaymentMethod {
    type: string;
    name?: string;
    brands?: string[];
}

type EMICardOverrides = 'showPayButton' | '_disableClickToPay';

export interface EMIConfiguration extends UIElementProps {
    supportedPaymentMethods?: EMISupportedPaymentMethod[];
    fundingSourceConfiguration?: {
        card?: Partial<Omit<CardConfiguration, EMICardOverrides>>;
    };
}
