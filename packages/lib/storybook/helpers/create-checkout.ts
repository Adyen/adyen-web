import { createSessionsCheckout } from './create-sessions-checkout';
import { createAdvancedFlowCheckout } from './create-advanced-checkout';
import Core from '../../src/core';

import type { GlobalStoryProps, ShopperDetails } from '../stories/types';

async function createCheckout(checkoutConfig: GlobalStoryProps, shopperDetails?: ShopperDetails): Promise<Core> {
    const { useSessions, ...rest } = checkoutConfig;

    const overidenPaymentMethodsAmount =
        (rest.paymentMethodsOverride?.paymentMethods?.length || 0) + (rest.paymentMethodsOverride?.storedPaymentMethods?.length || 0);
    const hasPaymentOveride = overidenPaymentMethodsAmount > 0;

    if (useSessions && !hasPaymentOveride) {
        return await createSessionsCheckout(rest, shopperDetails);
    } else if (useSessions && hasPaymentOveride) {
        console.warn('🟢 Checkout Storybook: paymentMethodsOverride is defined while using Sessions, forcing advance flow.');
    }
    return await createAdvancedFlowCheckout(rest, shopperDetails);
}

export { createCheckout };
