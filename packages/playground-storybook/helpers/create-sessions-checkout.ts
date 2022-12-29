import { createSession } from './checkout-api-calls';
import { amount, countryCode, returnUrl, shopperLocale, shopperReference } from '../config/commonConfig';
import AdyenCheckout from '@adyen/adyen-web';
import Core from '@adyen/adyen-web/dist/types/core';
import { handleChange, handleError, handleFinalState } from './checkout-handlers';

type Props = {
    showPayButton: boolean;
    paymentMethodsConfiguration: Record<string, object>;
};

async function createSessionsCheckout({ showPayButton, paymentMethodsConfiguration }: Props): Promise<Core> {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
        shopperEmail: 'shopper.ctp1@adyen.com',
        countryCode
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
