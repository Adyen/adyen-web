import { optionallyFilterUpiSubTxVariants } from '../elements/filters';
import type { ICore } from '../../../core/types';
import type UIElement from '../../internal/UIElement';
import type { PaymentMethod, StoredPaymentMethod } from '../../../core/ProcessResponse/PaymentMethods/PaymentMethods';
import type { PaymentMethodDisplayMode } from '../types';
import type { AnalyticsPaymentMethod } from '../../../core/Analytics/events/AnalyticsInfoEvent';

export interface PaymentMethodDisplayModeEntry {
    displayMode: PaymentMethodDisplayMode;
    paymentMethods: Array<PaymentMethod | StoredPaymentMethod>;
}

/**
 * Maps a raw /paymentMethods entry to the analytics-safe shape.
 * Allow-list only: StoredPaymentMethod carries PII (holderName, shopperEmail, …) that must never reach analytics.
 */
function toAnalyticsPaymentMethod(
    paymentMethod: PaymentMethod | StoredPaymentMethod,
    displayMode: PaymentMethodDisplayMode
): AnalyticsPaymentMethod<PaymentMethodDisplayMode> {
    const { type, brand, brands, fundingSource } = paymentMethod;
    const normalizedBrands = brands !== undefined ? brands : brand !== undefined ? [brand] : undefined;
    return {
        paymentMethodType: type,
        ...(normalizedBrands !== undefined && { brands: normalizedBrands }),
        ...(fundingSource !== undefined && { fundingSource }),
        displayMode
    };
}

/**
 * Payment methods present in the /paymentMethods response that Drop-in did not render,
 * for any reason, EXCEPT UPI sub-variants collapsed into a rendered `upi` parent.
 */
export function createUnavailablePaymentsList(
    displayModeEntries: PaymentMethodDisplayModeEntry[],
    elementsByDisplayMode: Record<PaymentMethodDisplayMode, UIElement[]>
): AnalyticsPaymentMethod<PaymentMethodDisplayMode>[] {
    return displayModeEntries.flatMap(entry => {
        const isStored = entry.displayMode === 'stored';

        const readyIds = new Set(
            (elementsByDisplayMode[entry.displayMode] || []).map(element =>
                isStored ? element.props.storedPaymentMethodId : element.props.paymentMethodId
            )
        );

        return optionallyFilterUpiSubTxVariants(entry.paymentMethods)
            .filter(paymentMethod => {
                const id = isStored ? (paymentMethod as StoredPaymentMethod).storedPaymentMethodId : (paymentMethod as PaymentMethod)._id;
                return !readyIds.has(id);
            })
            .map(paymentMethod => toAnalyticsPaymentMethod(paymentMethod, entry.displayMode));
    });
}

/**
 * Builds the ordered list of ready payment methods for the Drop-in analytics event
 * preserving the ordered display mode's parameter order.
 */
export function createAvailablePaymentsList(
    orderedDisplayModes: PaymentMethodDisplayMode[],
    elementsByDisplayMode: Record<PaymentMethodDisplayMode, UIElement[]>,
    core: ICore
): AnalyticsPaymentMethod<PaymentMethodDisplayMode>[] {
    return orderedDisplayModes.flatMap(displayMode =>
        (elementsByDisplayMode[displayMode] || [])
            .map(element => {
                const isStored = displayMode === 'stored';
                const id = isStored ? element.props.storedPaymentMethodId : element.props.paymentMethodId;
                if (!id) return undefined;

                const raw = isStored ? core.paymentMethodsResponse.findStoredPaymentMethod(id) : core.paymentMethodsResponse.findById(id);
                return raw ? toAnalyticsPaymentMethod(raw, displayMode) : undefined;
            })
            .filter((paymentMethod): paymentMethod is AnalyticsPaymentMethod<PaymentMethodDisplayMode> => paymentMethod !== undefined)
    );
}
