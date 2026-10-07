import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ErrorEventCode } from '../../core/Analytics/events/AnalyticsErrorEvent';
import { EMI_TOKEN_EXPIRED_ERROR_CODE, EMI_TOKEN_FIELD, SUPPORTED_ISSUER_FUNDING_SOURCE } from './constants';
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

/** The error body checkoutShopper answers with. `invalidFields` is present on validation errors only. */
interface AdyenApiError {
    errorCode: string;
    errorType: string;
    message: string;
    status: number;
    invalidFields?: { name?: string }[];
}

/** Mirrors the guard `core/Services/http.ts` keeps private, which is the only way an API error reaches `cause`. */
const isAdyenApiError = (value: unknown): value is AdyenApiError => {
    const error = value as Partial<AdyenApiError> | null | undefined;
    return Boolean(error?.errorCode && error.errorType && error.message && error.status);
};

/** A missing, malformed or undecodable `emiToken` is a validation error that names the token field. */
const isEmiTokenValidationError = ({ errorType, message, invalidFields }: AdyenApiError): boolean =>
    errorType === 'validation' &&
    ((Array.isArray(invalidFields) && invalidFields.some(field => field?.name === EMI_TOKEN_FIELD)) || message.includes(EMI_TOKEN_FIELD));

/**
 * @internal
 * Maps a rejected plans request to the analytics code it is reported with. Anything that is not an Adyen API
 * error naming the token, such as a timeout, a network or CORS failure, or an unreadable body, is a failed fetch.
 */
export const classifyEmiPlansError = (error: unknown): ErrorEventCode => {
    const cause = error instanceof AdyenCheckoutError ? error.options?.cause : undefined;

    if (!isAdyenApiError(cause)) return ErrorEventCode.EMI_PLANS_FETCH_FAILED;
    if (EMI_TOKEN_EXPIRED_ERROR_CODE && cause.errorCode === EMI_TOKEN_EXPIRED_ERROR_CODE) return ErrorEventCode.EMI_PLANS_TOKEN_EXPIRED;
    if (isEmiTokenValidationError(cause)) return ErrorEventCode.EMI_PLANS_TOKEN_INVALID;

    return ErrorEventCode.EMI_PLANS_FETCH_FAILED;
};
