import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ErrorEventCode } from '../../core/Analytics/events/AnalyticsErrorEvent';
import { EMI_PLANS_ERROR_MESSAGE, EMI_TOKEN_FIELD } from './constants';
import type { EmiIssuer, EmiPlan, EmiPlanPayload } from './types';

const toPayloadPlanType = (type: string): string => type.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

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
