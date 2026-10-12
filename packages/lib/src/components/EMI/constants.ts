import { TxVariants } from '../tx-variants';
import { TagVariant } from '../internal/Tag/types';
import { EMISupportedPaymentMethod } from './types';
import type { EmiPlanTypeKey } from './types';

export const SUPPORTED_PAYMENT_METHODS: Record<string, EMISupportedPaymentMethod> = {
    [TxVariants.scheme]: EMISupportedPaymentMethod.CARD
};

export const PLAN_TAGS: { type: EmiPlanTypeKey; translationKey: string; variant: TagVariant }[] = [
    { type: 'noCost', translationKey: 'emi.noCost', variant: TagVariant.SUCCESS },
    { type: 'lowCost', translationKey: 'emi.lowCost', variant: TagVariant.INFO }
];

export const EMI_PLANS_PATH = 'utility/v1/emi/plans';

export const EMI_PLANS_TIMEOUT_MS = 10000;

export const EMI_NO_INSTALLMENT_PLANS = '949';

export const EMI_TOKEN_FIELD = 'emiToken';

export const EMI_PLANS_ERROR_MESSAGE = 'EMI: Installment plans request failed';
