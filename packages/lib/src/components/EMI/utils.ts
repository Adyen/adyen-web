import AdyenCheckoutError, { IMPLEMENTATION_ERROR } from '../../core/Errors/AdyenCheckoutError';
import { ErrorEventCode } from '../../core/Analytics/events/AnalyticsErrorEvent';
import { getLocalisedPercentageFromBasisPoints } from '../../utils/percentage-util';
import { EMI_PLANS_ERROR_PREFIX, EMI_TOKEN_FIELD, PLAN_TAGS } from './constants';
import type Language from '../../language/Language';
import type { TagProps } from '../internal/Tag/types';
import type { EmiIssuer, EmiPlan, EmiPlanPayload, EmiPlanTypeKey } from './types';

export const buildEmiPlanPayload = (issuer: EmiIssuer, plan: EmiPlan): EmiPlanPayload => {
    const appliedOfferIds = plan.offers?.map(offer => offer.offerId);

    return {
        tenureMonths: plan.tenureMonths,
        issuerCode: issuer.issuerCode,
        fundingSource: issuer.fundingSource,
        planType: plan.type,
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

export const getPlanLabel = (plan: EmiPlan, i18n: Language): string => {
    const { monthlyPayableAmount } = plan.transactionAmounts;
    const tenure = i18n.get('installmentOptionMonths', { values: { times: String(plan.tenureMonths) } });
    const label = `${i18n.amount(monthlyPayableAmount.value, monthlyPayableAmount.currency)} x ${tenure}`;

    if (plan.type === 'noCost') return label;

    return `${label} | @${formatInterestRate(plan.interestRateBps, i18n)}`;
};

export const getSelectionAnnouncement = (plan: EmiPlan, i18n: Language): string => {
    const { authorizationAmount, totalPayableAmount } = plan.transactionAmounts;
    const reservedAmount = i18n.amount(authorizationAmount.value, authorizationAmount.currency);
    const totalAmount = i18n.amount(totalPayableAmount.value, totalPayableAmount.currency);

    return `${getPlanLabel(plan, i18n)}. ${i18n.get('emi.amountReservedOnCard')}: ${reservedAmount}. ${i18n.get('emi.totalAmountOverTime')}: ${totalAmount}`;
};

interface EmiPlansErrorCause {
    title?: string;
    status?: number;
    message?: string;
    invalidFields?: { name?: string }[];
}

const getEmiPlansErrorCause = (error: unknown): EmiPlansErrorCause => {
    if (!(error instanceof AdyenCheckoutError)) return {};
    // Only the SDK writes an IMPLEMENTATION_ERROR message; the message of a NETWORK_ERROR can carry the request URL.
    if (error.name === IMPLEMENTATION_ERROR) return { message: error.message };
    return error.options.cause ?? {};
};

export const getEmiPlansError = (error: unknown): { code: ErrorEventCode; message: string } => {
    const { status, title, message, invalidFields } = getEmiPlansErrorCause(error);
    const isTokenRejected = invalidFields?.some(field => field?.name === EMI_TOKEN_FIELD);
    const detail = status ? ` (${status}): ${title}` : message && `: ${message}`;

    return {
        code: isTokenRejected ? ErrorEventCode.EMI_PLANS_TOKEN_INVALID : ErrorEventCode.EMI_PLANS_FETCH_FAILED,
        message: `${EMI_PLANS_ERROR_PREFIX}${detail || ''}`
    };
};
