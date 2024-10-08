import { createSessionsCheckout } from './create-sessions-checkout';
import { createAdvancedFlowCheckout } from './create-advanced-checkout';
import { GlobalStoryProps } from '../stories/types';
import Core from '../../src/core';

async function createCheckout(checkoutConfig: GlobalStoryProps): Promise<Core> {
    const { useSessions, ...rest } = checkoutConfig;

    const overidenPaymentMethodsAmount =
        (rest.paymentMethodsOverride?.paymentMethods?.length || 0) + (rest.paymentMethodsOverride?.storedPaymentMethods?.length || 0);
    const hasPaymentOveride = overidenPaymentMethodsAmount > 0;

    if (useSessions && !hasPaymentOveride) {
        return await createSessionsCheckout(rest);
    } else if (useSessions && hasPaymentOveride) {
        console.warn('🟢 Checkout Storybook: paymentMethodsOverride is defined while using Sessions, forcing advance flow.');
    }
    return await createAdvancedFlowCheckout(rest);
}

export { createCheckout };
