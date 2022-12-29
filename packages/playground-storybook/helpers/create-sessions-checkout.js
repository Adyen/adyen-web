import { createSession } from './checkout-api-calls';
import { amount, countryCode, returnUrl, shopperLocale, shopperReference } from '../config/commonConfig';
import AdyenCheckout from '@adyen/adyen-web';

async function createSessionsCheckout({ showPayButton, paymentMethodsConfiguration }) {
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
        environment: process.env.CLIENT_ENV,
        clientKey: process.env.CLIENT_KEY,
        session,
        showPayButton,
        paymentMethodsConfiguration,

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onPaymentCompleted: (result, component) => {
            console.info(result, component);
        },
        onError: (error, component) => {
            console.info(JSON.stringify(error), component);
        },
        onChange: (state, component) => {
            console.log('onChange', state);
        }
    });

    return checkout;
}

export { createSessionsCheckout };
