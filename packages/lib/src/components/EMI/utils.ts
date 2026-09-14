import { SUPPORTED_ISSUER_FUNDING_SOURCE } from './constants';
import type { EmiIssuer, EmiOffer, EmiPlan, EmiPlanPayload, EmiPlansResponse } from './types';

/**
 * @internal
 * Returns the issuers that are supported by the SDK, filtered by funding source.
 */
export const resolvePlanIssuers = (plans?: EmiPlansResponse): EmiIssuer[] => {
    const issuers = Array.isArray(plans?.issuers) ? plans.issuers : [];

    return issuers.filter(issuer => issuer.fundingSource === SUPPORTED_ISSUER_FUNDING_SOURCE);
};

/** Ties keep the first offer in backend order, so the same response always resolves the same way. */
const higherOffer = (winner: EmiOffer, candidate: EmiOffer): EmiOffer => (candidate.amount.value > winner.amount.value ? candidate : winner);

/**
 * @internal
 * See ADR-0004-emi-plans-data-transformation for the display-offer policy.
 */
export const selectDisplayOffer = (offers: EmiOffer[] = []): EmiOffer | undefined =>
    offers.reduce<EmiOffer | undefined>((winner, candidate) => (winner ? higherOffer(winner, candidate) : candidate), undefined);

const toPayloadPlanType = (type: string): string => type.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

/**
 * @internal
 * The `emiPlan` object of the `/payments` request, built from the selection. Values are echoed from the
 * lookup response as it arrived, except `planType`, which the payment request spells in upper snake case.
 * The issuer travels under `issuerName`, the only issuer field the request defines, carrying the issuer
 * code the lookup returned. The offer sent is the one `selectDisplayOffer` shows, read from the same
 * field, so payload and display cannot drift. See ADR-0004-emi-plans-data-transformation.
 */
export const buildEmiPlanPayload = (issuer: EmiIssuer, plan: EmiPlan): EmiPlanPayload => {
    const offer = selectDisplayOffer(plan.offers);

    return {
        tenureMonths: plan.tenureMonths,
        issuerName: issuer.issuerCode,
        fundingSource: issuer.fundingSource,
        planType: toPayloadPlanType(plan.type),
        interestRateBps: plan.interestRateBps,
        ...(offer && { appliedOfferIds: [offer.offerId] })
    };
};
