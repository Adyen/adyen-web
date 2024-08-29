import { createSessionsCheckout } from './create-sessions-checkout';
import { createAdvancedFlowCheckout } from './create-advanced-checkout';
import { GlobalStoryProps } from '../stories/types';
import Core from '../../src/core';

async function createCheckout(checkoutConfig: GlobalStoryProps): Promise<Core> {
    const { useSessions, ...rest } = checkoutConfig;

    return useSessions ? await createSessionsCheckout(rest) : await createAdvancedFlowCheckout(rest);
}

export { createCheckout };
