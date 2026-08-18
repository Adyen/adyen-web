import { TxVariants } from '../tx-variants';
import { EMIFundingSource } from './types';
import type { EmiIssuerFundingSource, EmiPlanPayloadFundingSource, EmiPlanPayloadType, EmiPlanTypeKey } from './types';

export const SUPPORTED_FUNDING_SOURCES: Record<string, EMIFundingSource> = {
    [TxVariants.scheme]: EMIFundingSource.CARD
};

/**
 * `planType`, as the payment request requires it. Keyed by the response union, so a plan type added
 * to the lookup contract is a compile error here rather than a payload silently missing its type.
 */
export const PLAN_TYPE = {
    standard: 'STANDARD',
    noCost: 'NO_COST',
    lowCost: 'LOW_COST'
} as const satisfies Record<EmiPlanTypeKey, EmiPlanPayloadType>;

/** `fundingSource`, as the payment request requires it. Exhaustive for the same reason. */
export const ISSUER_FUNDING_SOURCE = {
    credit: 'CREDIT',
    debit: 'DEBIT'
} as const satisfies Record<EmiIssuerFundingSource, EmiPlanPayloadFundingSource>;

/** Fails to compile while a payment-request value has no lookup value mapping onto it. */
type NothingUnmapped<Unmapped extends never> = Unmapped;

/**
 * The other direction of both tables above: adding a value to a payment-request union without adding
 * the mapping that reaches it fails here, so neither side of the pair can drift on its own.
 */
export type EmiPayloadCasingIsExhaustive = [
    NothingUnmapped<Exclude<EmiPlanPayloadType, (typeof PLAN_TYPE)[EmiPlanTypeKey]>>,
    NothingUnmapped<Exclude<EmiPlanPayloadFundingSource, (typeof ISSUER_FUNDING_SOURCE)[EmiIssuerFundingSource]>>
];
