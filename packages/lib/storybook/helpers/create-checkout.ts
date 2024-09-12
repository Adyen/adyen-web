import { createSessionsCheckout } from './create-sessions-checkout';
import { createAdvancedFlowCheckout } from './create-advanced-checkout';
import { reject } from '../../src/utils/commonUtils';

async function createCheckout(context: any): Promise<any> {
    const { useSessions, showPayButton, countryCode, shopperLocale, amount, ...rest } = context.args;

    return useSessions
        ? await createSessionsCheckout({ showPayButton, countryCode, shopperLocale, amount })
        : await createAdvancedFlowCheckout({
              showPayButton,
              countryCode,
              shopperLocale,
              amount,
              ...reject(['componentConfiguration']).from(rest) // pass the "rest" of the specified config (excluding componentConfiguration, which is passed directly to the component)
          });
}

export { createCheckout };
