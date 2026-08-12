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
type ResolvedDisplayMode = Exclude<PaymentMethodDisplayMode, 'stored'>;

const getCustomDisplayMode = (paymentMethod: PaymentMethod): string | undefined => {
    const { configuration } = paymentMethod;

    if (!configuration || !('displayMode' in configuration)) {
        return;
    }

    const { displayMode } = configuration;

    if (typeof displayMode !== 'string' || !displayMode.trim().length) {
        return;
    }

    return displayMode;
};

export const hasCustomDisplayMode = (paymentMethods: PaymentMethod[]): boolean =>
    paymentMethods.some(paymentMethod => getCustomDisplayMode(paymentMethod) !== undefined);

/**
 * Decides which Drop-in section a payment method belongs to.
 */
const resolveDisplayMode = (
    paymentMethod: PaymentMethod,
    isCustomDisplayModeActive: boolean,
    instantPaymentTypes: InstantPaymentTypes[]
): ResolvedDisplayMode => {
    if (paymentMethod.type === 'fastlane') {
        return DisplayMode.fastlane;
    }

    if (!SUPPORTED_INSTANT_PAYMENTS.some(supportedType => supportedType === paymentMethod.type)) {
        return DisplayMode.regular;
    }

    const isInstant = isCustomDisplayModeActive
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
    const isCustomDisplayModeActive = hasCustomDisplayMode(paymentMethods);

    const groups: Record<ResolvedDisplayMode, PaymentMethod[]> = {
        [DisplayMode.fastlane]: [],
        [DisplayMode.instant]: [],
        [DisplayMode.regular]: []
    };

    paymentMethods.forEach(paymentMethod => {
        const displayMode = resolveDisplayMode(paymentMethod, isCustomDisplayModeActive, instantPaymentTypes);
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
