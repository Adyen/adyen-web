import { optionallyFilterUpiSubTxVariants } from '../elements/filters';
import type { ICore } from '../../../core/types';
import type UIElement from '../../internal/UIElement';
import type { PaymentMethod, StoredPaymentMethod } from '../../../core/ProcessResponse/PaymentMethods/PaymentMethods';
import type { PaymentMethodDisplayModeEntry, PaymentMethodDisplayMode } from '../types';

export type PaymentMethodWithDisplayMode = (PaymentMethod | StoredPaymentMethod) & { displayMode: PaymentMethodDisplayMode };

/**
 * Payment methods present in the /paymentMethods response that Drop-in did not render,
 * for any reason, EXCEPT UPI sub-variants collapsed into a rendered `upi` parent.
 */
export function getUnavailablePaymentMethods(
    displayModeEntries: PaymentMethodDisplayModeEntry[],
    elementsByDisplayMode: Record<PaymentMethodDisplayMode, UIElement[]>
): PaymentMethodWithDisplayMode[] {
    return displayModeEntries.flatMap(entry => {
        const isStored = entry.displayMode === 'stored';

        const readyIds = new Set(
            elementsByDisplayMode[entry.displayMode].map(element => (isStored ? element.props.storedPaymentMethodId : element.props.paymentMethodId))
        );

        return optionallyFilterUpiSubTxVariants(entry.paymentMethods)
            .filter(paymentMethod => {
                const id = isStored ? (paymentMethod as StoredPaymentMethod).storedPaymentMethodId : (paymentMethod as PaymentMethod)._id;
                return !readyIds.has(id);
            })
            .map(paymentMethod => ({ ...paymentMethod, displayMode: entry.displayMode }));
    });
}

/**
 * Builds the ordered list of ready payment methods for the Drop-in analytics event
 * preserving the ordered display mode's parameter order.
 */
export function getReadyPaymentMethods(
    orderedDisplayModes: PaymentMethodDisplayMode[],
    elementsByDisplayMode: Record<PaymentMethodDisplayMode, UIElement[]>,
    core: ICore
): PaymentMethodWithDisplayMode[] {
    return orderedDisplayModes.flatMap(displayMode =>
        elementsByDisplayMode[displayMode]
            .map(element => {
                const isStored = displayMode === 'stored';
                const id = isStored ? element.props.storedPaymentMethodId : element.props.paymentMethodId;
                if (!id) return undefined;

                const raw = isStored ? core.paymentMethodsResponse.findStoredPaymentMethod(id) : core.paymentMethodsResponse.findById(id);
                return raw ? { ...raw, displayMode } : undefined;
            })
            .filter((paymentMethod): paymentMethod is PaymentMethodWithDisplayMode => paymentMethod !== undefined)
    );
}
