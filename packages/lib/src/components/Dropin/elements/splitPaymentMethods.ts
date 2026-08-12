import PaymentMethods from '../../../core/ProcessResponse/PaymentMethods';
import { DisplayMode, SUPPORTED_INSTANT_PAYMENTS } from '../constants';
import type { InstantPaymentTypes, PaymentMethodDisplayMode } from '../types';
import type { PaymentMethod, StoredPaymentMethod } from '../../../core/ProcessResponse/PaymentMethods/PaymentMethods';

interface SplitPaymentMethods {
    fastlanePaymentMethod: PaymentMethod | undefined;
    storedPaymentMethods: StoredPaymentMethod[];
    paymentMethods: PaymentMethod[];
    instantPaymentMethods: PaymentMethod[];
}

/**
 * The display modes a payment method from the 'paymentMethods' array can resolve to.
 */
type ResolvedDisplayMode = Exclude<PaymentMethodDisplayMode, typeof DisplayMode.stored>;

const getCustomDisplayMode = (paymentMethod: PaymentMethod): string | undefined => {
    return paymentMethod.configuration?.displayMode;
};

/**
 * Decides which Drop-in section a payment method belongs to.
 */
const resolveDisplayMode = (
    paymentMethod: PaymentMethod,
    hasCustomDisplayMode: boolean,
    instantPaymentTypes: InstantPaymentTypes[]
): ResolvedDisplayMode => {
    if (paymentMethod.type === 'fastlane') {
        return DisplayMode.fastlane;
    }

    if (!SUPPORTED_INSTANT_PAYMENTS.includes(paymentMethod.type)) {
        return DisplayMode.regular;
    }

    const isInstant = hasCustomDisplayMode
        ? getCustomDisplayMode(paymentMethod) === DisplayMode.instant
        : instantPaymentTypes.includes(paymentMethod.type as InstantPaymentTypes);

    if (isInstant) {
        return DisplayMode.instant;
    }

    return DisplayMode.regular;
};

/**
 * Buckets the payment methods by the Drop-in section they belong to, preserving the response order within each bucket.
 */
const groupByDisplayMode = (
    paymentMethods: PaymentMethod[],
    instantPaymentTypes: InstantPaymentTypes[]
): Record<ResolvedDisplayMode, PaymentMethod[]> => {
    const hasCustomDisplayMode = paymentMethods.some(getCustomDisplayMode);

    const groups: Record<ResolvedDisplayMode, PaymentMethod[]> = {
        [DisplayMode.fastlane]: [],
        [DisplayMode.instant]: [],
        [DisplayMode.regular]: []
    };

    paymentMethods.forEach(paymentMethod => {
        const displayMode = resolveDisplayMode(paymentMethod, hasCustomDisplayMode, instantPaymentTypes);
        groups[displayMode].push(paymentMethod);
    });

    return groups;
};

function splitPaymentMethods(paymentMethods: PaymentMethods, instantPaymentTypes: InstantPaymentTypes[] = []): SplitPaymentMethods {
    const groups = groupByDisplayMode(paymentMethods.paymentMethods, instantPaymentTypes);

    return {
        fastlanePaymentMethod: groups[DisplayMode.fastlane][0],
        instantPaymentMethods: groups[DisplayMode.instant],
        paymentMethods: groups[DisplayMode.regular],
        storedPaymentMethods: paymentMethods.storedPaymentMethods
    };
}

export default splitPaymentMethods;
