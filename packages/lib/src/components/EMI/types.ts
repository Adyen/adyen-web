import type { UIElementProps } from '../internal/UIElement/types';
import type CardElement from '../Card';
import type { CardConfiguration, CardElementData } from '../Card/types';
import type { PaymentAmount } from '../../types/global-types';
import { TxVariants } from '../tx-variants';

export enum EMIFundingSource {
    CARD = TxVariants.card
}

/**
 * Payment elements EMI can delegate to. Each one must expose a public 'formatData()'
 */
export type EMIFundingSourceElement = CardElement;

export type EMIFundingSourceData = CardElementData;

export interface SupportedPaymentMethod {
    type: string;
    name?: string;
    brands?: string[];
}

/** Plan type, as the plans response reports it. */
export type EmiPlanTypeKey = 'standard' | 'noCost' | 'lowCost';

/** Funding source of an issuer, as the plans response reports it. */
export type EmiIssuerFundingSource = 'credit' | 'debit';

/**
 * Raw shape of the Checkout API `POST /paymentMethods/emi/plans` response (v72+). The view and the
 * payment request read it as it arrives, so what the contract guarantees is required here and only
 * what the contract really leaves out is optional. `type` and `fundingSource` are closed sets, and a
 * value added to either one is a new SDK version rather than a case to handle at runtime: the casing
 * tables of `constants.ts` are what has to learn it.
 */
export interface EmiTransactionAmounts {
    totalPayableAmount: PaymentAmount;
    monthlyPayableAmount: PaymentAmount;
    totalInterestAmount: PaymentAmount;
}

export interface EmiOffer {
    /** Sent on the payment request as one of `appliedOfferIds`. */
    offerId: string;
    type?: string;
    amount: PaymentAmount;
    description?: string;
}

export interface EmiPlan {
    type: EmiPlanTypeKey;
    tenureMonths: number;
    /** Basis points. 1599 = 15.99% p.a. */
    interestRateBps: number;
    transactionAmounts: EmiTransactionAmounts;
    /**
     * Every discount the payment request can apply to this plan, in backend order. `appliedOfferIds`
     * takes a list, so all of them ride on the payload while the design shows only the largest, which
     * `selectDisplayOffer` picks.
     */
    offers?: EmiOffer[];
}

export interface EmiIssuer {
    /** e.g. `HDFC Bank`. Rendered as the provider label. */
    issuerName: string;
    /**
     * e.g. `HDFC`. Sent on the payment request as `issuerName`, exactly as it arrived: the backend
     * matches it against the card BIN by string equality, so never send a normalised copy of it.
     */
    issuerCode: string;
    fundingSource: EmiIssuerFundingSource;
    plans: EmiPlan[];
}

export interface EmiPlansResponse {
    issuers: EmiIssuer[];
}

/** The provider and plan the payment request is built from, as the lookup reported them. */
export interface EmiSelection {
    issuer: EmiIssuer;
    plan: EmiPlan;
}

type EMICardOverrides = 'showPayButton' | '_disableClickToPay';

export interface EMIConfiguration extends UIElementProps {
    supportedPaymentMethods?: SupportedPaymentMethod[];
    /**
     * Installment plans, as returned by the Checkout API `POST /paymentMethods/emi/plans` endpoint.
     * Pass the response verbatim.
     *
     * Required in the advanced flow: the SDK holds a client key and cannot call that
     * merchant-authenticated endpoint itself. Without it, EMI offers no plan selection and Drop-in
     * drops the EMI tile. It becomes optional for sessions integrations once the sessions endpoint
     * ships, at which point the SDK fetches the plans itself.
     */
    plans?: EmiPlansResponse;
    fundingSourceConfiguration?: {
        card?: Partial<Omit<CardConfiguration, EMICardOverrides>>;
    };
}
