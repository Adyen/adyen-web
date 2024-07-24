import { createSessionsCheckout } from './create-sessions-checkout';
import { createAdvancedFlowCheckout } from './create-advanced-checkout';

async function createCheckout(context: any): Promise<any> {
    const { useSessions, showPayButton, countryCode, shopperLocale, amount } = context.args;

    return useSessions
        ? await createSessionsCheckout({ showPayButton, countryCode, shopperLocale, amount })
        : await createAdvancedFlowCheckout({
              showPayButton,
              countryCode,
              shopperLocale,
              amount
          });
}

export { createCheckout };
