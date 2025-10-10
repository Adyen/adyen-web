import { createSessionsCheckout } from './create-sessions-checkout';
import { createAdvancedFlowCheckout } from './create-advanced-checkout';
import Core from '../../src/core';

import type { GlobalStoryProps, ShopperDetails } from '../types';

async function createCheckout(checkoutConfig: GlobalStoryProps, shopperDetails?: ShopperDetails): Promise<Core> {
    const { useSessions, ...rest } = checkoutConfig;

    const overriddenPaymentMethodsAmount =
        (rest.paymentMethodsOverride?.paymentMethods?.length || 0) + (rest.paymentMethodsOverride?.storedPaymentMethods?.length || 0);
    const hasPaymentOverridden = overriddenPaymentMethodsAmount > 0;

    if (useSessions) {
        if (!hasPaymentOverridden && !rest.allowedPaymentTypes) {
            return await createSessionsCheckout(rest, shopperDetails);
        } else {
            console.warn('🟢 Checkout Storybook: Forcing advance flow.');
        }
    }

    return await createAdvancedFlowCheckout(rest, shopperDetails);
}

export { createCheckout };
