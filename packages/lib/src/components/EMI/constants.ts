import { TxVariants } from '../tx-variants';
import { EMISupportedPaymentMethod } from './types';
import type { EmiIssuerFundingSource } from './types';

export const SUPPORTED_PAYMENT_METHODS: Record<string, EMISupportedPaymentMethod> = {
    [TxVariants.scheme]: EMISupportedPaymentMethod.CARD
};

/**
 * Credit card EMI is what this version implements, end to end: the copy, the plan summary and the card form all
 * describe a credit card. An allowlist rather than a `debit` exclusion, so a funding source the response gains
 * after this release is left out by construction rather than rendered on a screen built for none of it.
 */
export const SUPPORTED_ISSUER_FUNDING_SOURCE: EmiIssuerFundingSource = 'credit';
