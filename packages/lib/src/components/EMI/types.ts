import type { UIElementProps } from '../internal/UIElement/types';
import type CardElement from '../Card';
import type { CardConfiguration } from '../Card/types';
import type { PaymentAmount } from '../../types/global-types';
import type { UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { TxVariants } from '../tx-variants';

export enum EMIFundingSource {
    CARD = TxVariants.card
}

/**
 * The concrete element class EMI owns per funding source. Typing the children concretely, rather than
 * as the abstract `UIElement`, is what lets EMI merge a child's payment data: `formatData()` is public
 * on the concrete classes and `protected` on the base. Extend this map when a new funding source ships.
 */
export interface EMIFundingSourceElements {
    [EMIFundingSource.CARD]: CardElement;
}

export type EMIFundingSourceElement = EMIFundingSourceElements[EMIFundingSource];

export interface SupportedPaymentMethod {
    type: string;
    name?: string;
    brands?: string[];
}

export type EmiPlanTypeKey = 'standard' | 'noCost' | 'lowCost';

export type EmiIssuerFundingSource = 'credit' | 'debit';

export interface EmiTransactionAmounts {
    totalPayableAmount: PaymentAmount;
    monthlyPayableAmount: PaymentAmount;
    totalInterestAmount: PaymentAmount;
}

export interface EmiOffer {
    /** Sent on the payment request as `appliedOfferIds` when this is the offer the shopper was shown. */
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

export interface EmiSelection {
    issuer: EmiIssuer;
    plan: EmiPlan;
}

/** The select component the shopper changed. Absent when the component preselected on the shopper's behalf. */
export type EmiSelectTarget = UiTarget.emiProvider | UiTarget.emiPlan;

/** The `emiPlan` object of the `/payments` request: the selected plan and issuer, as the lookup returned them. */
export interface EmiPlanPayload {
    tenureMonths: number;
    /** Carries `EmiIssuer.issuerCode`, e.g. `HDFC`: the request field is named after the name, but holds the code. */
    issuerName: string;
    fundingSource: EmiIssuerFundingSource;
    /** Upper snake case of the lookup's plan type: `noCost` travels as `NO_COST`. */
    planType: string;
    interestRateBps: number;
    appliedOfferIds?: string[];
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
