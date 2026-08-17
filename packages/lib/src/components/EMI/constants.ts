import { TxVariants } from '../tx-variants';
import { EMIFundingSource } from './types';
import type { EmiIssuerFundingSource, EmiPlanTypeKey } from './types';

export const SUPPORTED_FUNDING_SOURCES: Record<string, EMIFundingSource> = {
    [TxVariants.scheme]: EMIFundingSource.CARD
};

/**
 * `planType`, as the payment request requires it. `Record` over the response union, so a plan type
 * added to the contract is a compile error here rather than a payload silently missing its type.
 */
export const PLAN_TYPE: Record<EmiPlanTypeKey, string> = {
    standard: 'STANDARD',
    noCost: 'NO_COST',
    lowCost: 'LOW_COST'
};

/** `fundingSource`, as the payment request requires it. Exhaustive for the same reason. */
export const ISSUER_FUNDING_SOURCE: Record<EmiIssuerFundingSource, string> = {
    credit: 'CREDIT',
    debit: 'DEBIT'
};
