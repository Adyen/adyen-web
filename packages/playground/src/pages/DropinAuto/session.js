import { AdyenCheckout, Dropin } from '@adyen/adyen-web/auto';
import '@adyen/adyen-web/styles/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, shopperReference, countryCode, returnUrl } from '../../config/commonConfig';
import { handleOnPaymentCompleted, handleOnPaymentFailed } from '../../handlers';

export async function initSession() {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
        telephoneNumber: '+611223344',
        shopperEmail: 'shopper.ctp1@adyen.com',
        countryCode
    });

    const checkout = await AdyenCheckout({
        environment: process.env.__CLIENT_ENV__,
        clientKey: process.env.__CLIENT_KEY__,
        session,

        locale: shopperLocale,
        _environmentUrls: {
            cdn: {
                translations: '/'
            }
        },

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onError: (error, component) => {
            console.info(JSON.stringify(error), component);
        },
        onChange: (state, component) => {
            console.log('onChange', state);
        },
        onPaymentCompleted: handleOnPaymentCompleted,
        onPaymentFailed: handleOnPaymentFailed
    });

    const dropin = new Dropin(checkout, {
        instantPaymentTypes: ['googlepay'],
        paymentMethodsConfiguration: {
            paywithgoogle: {
                buttonType: 'plain'
            },
            card: {
                hasHolderName: true,
                holderNameRequired: true,
                holderName: 'J. Smith',
                positionHolderNameOnTop: true,

                // billingAddress config:
                billingAddressRequired: true,
                billingAddressMode: 'partial'
            }
        }
    }).mount('#dropin-container');
    return [checkout, dropin];
}
