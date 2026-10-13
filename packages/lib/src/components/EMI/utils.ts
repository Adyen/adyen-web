import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ErrorEventCode } from '../../core/Analytics/events/AnalyticsErrorEvent';
import { getLocalisedPercentageFromBasisPoints } from '../../utils/percentage-util';
import { EMI_PLANS_ERROR_PREFIX, EMI_TOKEN_FIELD, PLAN_TAGS } from './constants';
import type Language from '../../language/Language';
import type { TagProps } from '../internal/Tag/types';
import type { EmiIssuer, EmiPlan, EmiPlanPayload, EmiPlanTypeKey } from './types';

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

export const getPlanTags = (types: EmiPlanTypeKey[], i18n: Language): TagProps[] | undefined => {
    const tags = PLAN_TAGS.filter(({ type }) => types.includes(type)).map(({ translationKey, variant }) => ({
        label: i18n.get(translationKey),
        variant
    }));

    return tags.length ? tags : undefined;
};

export const formatInterestRate = (interestRateBps: number, i18n: Language): string =>
    `${getLocalisedPercentageFromBasisPoints(interestRateBps, i18n.locale)} ${i18n.get('emi.perAnnum')}`;

interface EmiPlansErrorCause {
    title?: string;
    status?: number;
    message?: string;
    invalidFields?: { name?: string }[];
}

const getEmiPlansErrorMessage = ({ status, title, message }: EmiPlansErrorCause = {}): string => {
    if (status) return `${EMI_PLANS_ERROR_PREFIX} (${status}): ${title}`;
    if (message) return `${EMI_PLANS_ERROR_PREFIX}: ${message}`;
    return EMI_PLANS_ERROR_PREFIX;
};

export const getEmiPlansError = (error: unknown): { code: ErrorEventCode; message: string } => {
    const cause = (error instanceof AdyenCheckoutError ? error.options?.cause : undefined) as EmiPlansErrorCause | undefined;
    const isTokenRejected = cause?.invalidFields?.some(field => field?.name === EMI_TOKEN_FIELD);

    return {
        code: isTokenRejected ? ErrorEventCode.EMI_PLANS_TOKEN_INVALID : ErrorEventCode.EMI_PLANS_FETCH_FAILED,
        message: getEmiPlansErrorMessage(cause)
    };
};
