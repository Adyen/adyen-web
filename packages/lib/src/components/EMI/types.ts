import type { UIElementProps } from '../internal/UIElement/types';
import type CardElement from '../Card';
import type { CardConfiguration } from '../Card/types';
import type { PaymentAmount, PaymentData } from '../../types/global-types';
import type { UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { TxVariants } from '../tx-variants';

export enum EMISupportedPaymentMethod {
    CARD = TxVariants.card
}

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
    authorizationAmount: PaymentAmount;
    totalPayableAmount: PaymentAmount;
    monthlyPayableAmount: PaymentAmount;
    totalInterestAmount: PaymentAmount;
    totalInstantDiscountAmount?: PaymentAmount;
    interestDiscountAmount?: PaymentAmount;
    additionalDiscountAmount?: PaymentAmount;
}

export interface EmiProcessingAmounts {
    totalAmount: PaymentAmount;
    feeAmount: PaymentAmount;
    taxAmount: PaymentAmount;
    maxAmount?: PaymentAmount;
    type: string;
    message: string;
}

export interface EmiOffer {
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
    offers?: EmiOffer[];
}

export interface EmiIssuer {
    issuerName: string;
    issuerCode: string;
    fundingSource: EmiIssuerFundingSource;
    availablePlanTypes: EmiPlanTypeKey[];
    bestOffer?: PaymentAmount;
    termLink?: string;
    plans: EmiPlan[];
}

export interface EmiPlansResponse {
    issuers: EmiIssuer[];
}

export interface EmiSelection {
    issuer: EmiIssuer;
    plan: EmiPlan;
}

export type EmiSelectTarget = UiTarget.emiProvider | UiTarget.emiPlan;

export interface EmiPlanPayload {
    tenureMonths: number;
    issuerCode: string;
    fundingSource: EmiIssuerFundingSource;
    planType: EmiPlanTypeKey;
    interestRateBps: number;
    appliedOfferIds?: string[];
}

export interface EMIPaymentData extends PaymentData {
    emiPlan?: EmiPlanPayload;
}

type EMICardOverrides = 'showPayButton' | '_disableClickToPay' | 'fundingSource';

export interface EMIConfiguration extends UIElementProps {
    supportedPaymentMethodsConfiguration?: {
        card?: Partial<Omit<CardConfiguration, EMICardOverrides>>;
    };
}

export interface EmiPaymentMethodEntry {
    supportedPaymentMethods?: SupportedPaymentMethod[];
    configuration?: { emiToken?: string };
}

export type EmiPlansState = { status: 'ready'; issuers: EmiIssuer[] } | { status: 'unavailable' };
