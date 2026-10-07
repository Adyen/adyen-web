import type { UIElementProps } from '../internal/UIElement/types';
import type CardElement from '../Card';
import type { CardConfiguration } from '../Card/types';
import type { PaymentAmount, PaymentData } from '../../types/global-types';
import type { UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { TxVariants } from '../tx-variants';

export enum EMISupportedPaymentMethod {
    CARD = TxVariants.card
}

/**
 * The concrete element class EMI owns per supported payment method. Typing the children concretely, rather
 * than as the abstract `UIElement`, is what lets EMI merge a child's payment data: `formatData()` is public
 * on the concrete classes and `protected` on the base. Extend this map when a new supported payment method ships.
 */
export interface EMISupportedPaymentMethodElements {
    [EMISupportedPaymentMethod.CARD]: CardElement;
}

export type EMISupportedPaymentMethodElement = EMISupportedPaymentMethodElements[EMISupportedPaymentMethod];

export interface SupportedPaymentMethod {
    type: string;
    name?: string;
    brands?: string[];
}

export type EmiPlanTypeKey = 'standard' | 'noCost' | 'lowCost';

export type EmiIssuerFundingSource = 'credit' | 'debit';

export interface EmiTransactionAmounts {
    /** What the card is charged now: the checkout amount less every discount taken off the authorisation. */
    authorizationAmount: PaymentAmount;
    totalPayableAmount: PaymentAmount;
    monthlyPayableAmount: PaymentAmount;
    totalInterestAmount: PaymentAmount;
    /** Absent on a plan that carries no instant discount. */
    totalInstantDiscountAmount?: PaymentAmount;
    /** The money that buys the interest down. Absent on a plan whose interest is not discounted. */
    interestDiscountAmount?: PaymentAmount;
    additionalDiscountAmount?: PaymentAmount;
}

/** The processing fee the bank charges on top of the plan. `message` is shopper-facing copy the backend owns. */
export interface EmiProcessingAmounts {
    totalAmount: PaymentAmount;
    feeAmount: PaymentAmount;
    taxAmount: PaymentAmount;
    type: string;
    message: string;
}

/**
 * An offer priced into its plan's amounts: membership of `EmiPlan.offers` is what says it applies, so there
 * is no `applied` flag and nothing to choose between. Carries no amount, because the discount rows read the
 * `transactionAmounts` totals, so `type` and `description` are informational and rendered nowhere.
 */
export interface EmiOffer {
    /** Sent on the payment request as one of `appliedOfferIds`. */
    offerId: string;
    type?: string;
    description?: string;
}

export interface EmiPlan {
    type: EmiPlanTypeKey;
    tenureMonths: number;
    /** Basis points. 1599 = 15.99% p.a. */
    interestRateBps: number;
    transactionAmounts: EmiTransactionAmounts;
    processingAmounts: EmiProcessingAmounts;
    /** Absent on a plan the bank attached no offer to. */
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
    /** Every plan type this bank offers. Drives the tags on the provider row. */
    availablePlanTypes: EmiPlanTypeKey[];
    /** The largest instant discount among this issuer's plans. Absent when it offers none. */
    bestOffer?: PaymentAmount;
    /**
     * The bank's terms page. Ends up in an `href`, so it is rendered only when it is an `https` URL.
     * Absent until the backend returns it, in which case the terms render unlinked.
     */
    termLink?: string;
    /** In display order: ascending tenure, sorted by the backend. */
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

export interface EMIPaymentData extends PaymentData {
    emiPlan?: EmiPlanPayload;
}

type EMICardOverrides = 'showPayButton' | '_disableClickToPay' | 'fundingSource';

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
    supportedPaymentMethodsConfiguration?: {
        card?: Partial<Omit<CardConfiguration, EMICardOverrides>>;
    };
}
