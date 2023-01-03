import { createSession } from './checkout-api-calls';
import { returnUrl, shopperReference } from '../config/commonConfig';
import AdyenCheckout from '@adyen/adyen-web';
import Core from '@adyen/adyen-web/dist/types/core';
import { handleChange, handleError, handleFinalState } from './checkout-handlers';
import getCurrency from '../utils/get-currency';
import { AdyenCheckoutProps } from '../stories/types';

async function createSessionsCheckout({
    showPayButton,
    paymentMethodsConfiguration,
    countryCode,
    shopperLocale,
    amount
}: AdyenCheckoutProps): Promise<Core> {
    debugger;

    const session = await createSession({
        amount: {
            currency: getCurrency(countryCode),
            value: Number(amount)
        },
        shopperLocale,
        countryCode,
        reference: 'ABC123',
        returnUrl,
        shopperReference,
        shopperEmail: 'shopper.ctp1@adyen.com'
    });

    const checkout = await AdyenCheckout({
        clientKey: process.env.CLIENT_KEY,
        environment: process.env.CLIENT_ENV,
        session,
        showPayButton,
        paymentMethodsConfiguration,

        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },

        onPaymentCompleted: (result, component) => {
            handleFinalState(result, component);
        },

        onError: (error, component) => {
            handleError(error, component);
        },

        onChange: (state, component) => {
            handleChange(state, component);
        }
    });

    return checkout;
}

export { createSessionsCheckout };
