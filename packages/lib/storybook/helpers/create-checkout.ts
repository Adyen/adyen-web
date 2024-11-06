import { createSessionsCheckout } from './create-sessions-checkout';
import { createAdvancedFlowCheckout } from './create-advanced-checkout';
import { GlobalStoryProps } from '../stories/types';
import Core from '../../src/core';

async function createCheckout(checkoutConfig: GlobalStoryProps): Promise<Core> {
    const { useSessions, ...rest } = checkoutConfig;

    const overriddenPaymentMethodsAmount =
        (rest.paymentMethodsOverride?.paymentMethods?.length || 0) + (rest.paymentMethodsOverride?.storedPaymentMethods?.length || 0);
    const hasPaymentOverridden = overriddenPaymentMethodsAmount > 0;

    if (useSessions) {
        if (!hasPaymentOverridden && !rest.allowedPaymentTypes) {
            return await createSessionsCheckout(rest);
        } else {
            console.warn('🟢 Checkout Storybook: Forcing advance flow.');
        }
    }

    return await createAdvancedFlowCheckout(rest);
}

export { createCheckout };
