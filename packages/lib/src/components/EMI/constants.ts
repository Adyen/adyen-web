import { TxVariants } from '../tx-variants';
import { TagVariant } from '../internal/Tag/types';
import { EMISupportedPaymentMethod } from './types';
import type { EmiIssuerFundingSource, EmiPlanTypeKey } from './types';

export const SUPPORTED_PAYMENT_METHODS: Record<string, EMISupportedPaymentMethod> = {
    [TxVariants.scheme]: EMISupportedPaymentMethod.CARD
};

/**
 * Credit card EMI is what this version implements, end to end: the copy, the plan summary and the card form all
 * describe a credit card. An allowlist rather than a `debit` exclusion, so a funding source the response gains
 * after this release is left out by construction rather than rendered on a screen built for none of it.
 */
export const SUPPORTED_ISSUER_FUNDING_SOURCE: EmiIssuerFundingSource = 'credit';

/** Shared by the selects, which advertise what a provider offers, and by the summary, which tags the selected plan. */
export const PLAN_TAGS: { type: EmiPlanTypeKey; translationKey: string; variant: TagVariant }[] = [
    { type: 'noCost', translationKey: 'emi.noCost', variant: TagVariant.SUCCESS },
    { type: 'lowCost', translationKey: 'emi.lowCost', variant: TagVariant.INFO }
];

/** Only a tagged plan can carry an interest discount: the offer is what buys the interest down. */
export const INTEREST_DISCOUNT_PLAN_TYPES: EmiPlanTypeKey[] = ['noCost', 'lowCost'];

/**
 * Terms of the bank whose plan the shopper selected, keyed by `EmiIssuer.issuerCode`. An issuer that is
 * absent renders the terms copy unlinked.
 * TODO: drop this map once the plans lookup returns the terms URL per issuer.
 */
export const ISSUER_TERMS_URLS: Record<string, string> = {
    HDFC: 'https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/personal-banking/discover-products/cards/smartemi/terms-and-conditions-smartemi-dial-an-emi.pdf',
    ICICI: 'https://www.icici.bank.in/personal-banking/cards/credit-card/emi-credit-card/emi-on-call/terms-and-conditions'
};
