import type { UIElementProps } from '../internal/UIElement/types';
import type { CardConfiguration } from '../Card/types';
import type { PaymentAmount } from '../../types/global-types';
import { TxVariants } from '../tx-variants';

export enum EMIFundingSource {
    CARD = TxVariants.card
}

export interface SupportedPaymentMethod {
    type: string;
    name?: string;
    brands?: string[];
}

export type EmiPlanTypeKey = 'standard' | 'noCost' | 'lowCost';

/** Funding source of an issuer, as the plans response reports it. */
export type EmiIssuerFundingSource = 'credit' | 'debit';

/** A discount the shopper is granted on a plan. */
export interface EmiPlanOffer {
    id: string;
    amount: PaymentAmount;
}

export interface EmiPlanOption {
    /** Unique across the whole list: `${issuerId}:${tenureMonths}:${type}` */
    id: string;
    tenureMonths: number;
    type: EmiPlanTypeKey;
    /** Basis points. 1599 = 15.99% p.a. */
    interestRateBps: number;
    monthlyPayableAmount?: PaymentAmount;
    totalPayableAmount?: PaymentAmount;
    totalInterestAmount?: PaymentAmount;
    /**
     * The single winning offer for this plan, if any: the highest discount amount available.
     * Drives the discount banner and the `Discount` summary row, so what the shopper sees is
     * always exactly what gets sent.
     */
    selectedOffer?: EmiPlanOffer;
}

export interface EmiIssuerOption {
    /** `issuerCode`, lowercased. Doubles as the CDN logo lookup key. */
    id: string;
    /** `issuerName`, echoed verbatim. Rendered as the provider label. */
    name: string;
    fundingSource: EmiIssuerFundingSource;
    plans: EmiPlanOption[];
}

export interface EmiSelection {
    issuer: EmiIssuerOption;
    plan: EmiPlanOption;
}

type EMICardOverrides = 'showPayButton' | '_disableClickToPay';

export interface EMIConfiguration extends UIElementProps {
    supportedPaymentMethods?: SupportedPaymentMethod[];
    fundingSourceConfiguration?: {
        card?: Partial<Omit<CardConfiguration, EMICardOverrides>>;
    };
}
