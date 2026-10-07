import { SUPPORTED_ISSUER_FUNDING_SOURCE } from './constants';
import type { EmiIssuer, EmiPlan, EmiPlanPayload, EmiPlansResponse } from './types';

/**
 * @internal
 * Returns the issuers that are supported by the SDK, filtered by funding source. The backend does not
 * guarantee a non-empty `plans` list, so an issuer without plans is dropped too.
 */
export const resolvePlanIssuers = (plans?: EmiPlansResponse): EmiIssuer[] =>
    (Array.isArray(plans?.issuers) ? plans.issuers : []).filter(
        issuer => issuer.fundingSource === SUPPORTED_ISSUER_FUNDING_SOURCE && issuer.plans?.length > 0
    );

const toPayloadPlanType = (type: string): string => type.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

/**
 * @internal
 * The `emiPlan` object of the `/payments` request, built from the selection. Values are echoed from the
 * lookup response as it arrived, except `planType`, which the payment request spells in upper snake case.
 * The issuer travels under `issuerName`, the only issuer field the request defines, carrying the issuer
 * code the lookup returned. Every offer the plan lists was priced into it, so every id is sent.
 * See ADR-0004-emi-plans-data-transformation.
 */
export const buildEmiPlanPayload = (issuer: EmiIssuer, plan: EmiPlan): EmiPlanPayload => {
    const appliedOfferIds = plan.offers?.map(offer => offer.offerId);

    return {
        tenureMonths: plan.tenureMonths,
        issuerName: issuer.issuerCode,
        fundingSource: issuer.fundingSource,
        planType: toPayloadPlanType(plan.type),
        interestRateBps: plan.interestRateBps,
        ...(appliedOfferIds?.length && { appliedOfferIds })
    };
};
