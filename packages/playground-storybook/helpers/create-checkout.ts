import Core from '@adyen/adyen-web/dist/types/core';
import { createSessionsCheckout } from './create-sessions-checkout';
import { createAdvancedFlowCheckout } from './create-advanced-checkout';

async function createCheckout(context: any): Promise<Core> {
    const { useSessions, paymentMethodsConfiguration, showPayButton, countryCode, shopperLocale, amount } = context.args;

    const checkout = useSessions
        ? await createSessionsCheckout({ showPayButton, paymentMethodsConfiguration, countryCode, shopperLocale, amount })
        : await createAdvancedFlowCheckout({ paymentMethodsConfiguration, showPayButton, countryCode, shopperLocale, amount });

    return checkout;
}

export { createCheckout };
