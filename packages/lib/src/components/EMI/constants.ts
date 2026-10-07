import { TxVariants } from '../tx-variants';
import { TagVariant } from '../internal/Tag/types';
import { EMISupportedPaymentMethod } from './types';
import type { EmiPlanTypeKey } from './types';

export const SUPPORTED_PAYMENT_METHODS: Record<string, EMISupportedPaymentMethod> = {
    [TxVariants.scheme]: EMISupportedPaymentMethod.CARD
};

/** Shared by the selects, which advertise what a provider offers, and by the summary, which tags the selected plan. */
export const PLAN_TAGS: { type: EmiPlanTypeKey; translationKey: string; variant: TagVariant }[] = [
    { type: 'noCost', translationKey: 'emi.noCost', variant: TagVariant.SUCCESS },
    { type: 'lowCost', translationKey: 'emi.lowCost', variant: TagVariant.INFO }
];

/**
 * checkoutShopper path of the plans lookup, relative to the `loadingContext`, with the client key appended as a
 * `clientKey` query parameter. The resource lives with the other checkoutShopper utility resources, which are
 * served under `utility/v1/`, like the PayByBankPix and Fastlane ones.
 */
export const EMI_PLANS_PATH = 'utility/v1/emi/plans';

/**
 * The shopper watches a spinner while the plans load, so the request gets a bound well below the 60 s default.
 * Matches the requests PayByBankPix makes while the shopper waits, until the backend sets a latency target.
 */
export const EMI_PLANS_TIMEOUT_MS = 10000;

/**
 * `validationErrorCode` of the info event sent when the backend answered with an empty issuers list.
 * Shared with the iOS and Android SDKs through adyen-checkout-sdk-meta `alignment/AnalyticsErrors.json`.
 */
export const EMI_NO_INSTALLMENT_PLANS = '949';

/** Field of the plans request body the backend names in its validation error when the token is rejected. */
export const EMI_TOKEN_FIELD = 'emiToken';

/**
 * `errorCode` the backend answers an expired `emiToken` with. Not distinguishable from an invalid token yet,
 * both are a validation error on `emiToken`, so it is unset and an expired token is reported as invalid.
 */
export const EMI_TOKEN_EXPIRED_ERROR_CODE: string | undefined = undefined;
