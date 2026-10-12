import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ErrorEventCode } from '../../core/Analytics/events/AnalyticsErrorEvent';
import { EMI_PLANS_ERROR_MESSAGE, EMI_TOKEN_FIELD } from './constants';
import type { EmiIssuer, EmiPlan, EmiPlanPayload } from './types';

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

interface EmiPlansErrorBody {
    title?: string;
    invalidFields?: { name?: string }[];
}

const getErrorBody = (error: unknown) =>
    (error instanceof AdyenCheckoutError ? error.options?.cause : undefined) as EmiPlansErrorBody | null | undefined;

export const classifyEmiPlansError = (error: unknown): ErrorEventCode =>
    getErrorBody(error)?.invalidFields?.some(field => field?.name === EMI_TOKEN_FIELD)
        ? ErrorEventCode.EMI_PLANS_TOKEN_INVALID
        : ErrorEventCode.EMI_PLANS_FETCH_FAILED;

export const describeEmiPlansError = (error: unknown): string => {
    const title = getErrorBody(error)?.title;
    return title ? `${EMI_PLANS_ERROR_MESSAGE}: ${title}` : EMI_PLANS_ERROR_MESSAGE;
};
