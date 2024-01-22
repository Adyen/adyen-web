import { AdyenCheckout, Dropin } from '@adyen/adyen-web/auto';
import '@adyen/adyen-web/styles/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, shopperReference, countryCode, returnUrl } from '../../config/commonConfig';
import getTranslationFile from '../../config/getTranslation';

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
        translationFile: getTranslationFile(shopperLocale),

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onPaymentCompleted(data, component) {
            console.info('onPaymentCompleted', data, component);
            component.setStatus('success');
        },
        onPaymentFailed(data, component) {
            console.info('onPaymentFailed', data, component);
            component.setStatus('error');
        },
        onError: (error, component) => {
            console.info(JSON.stringify(error), component);
        },
        onChange: (state, component) => {
            console.log('onChange', state);
        }
    });

    const dropin = new Dropin({
        core: checkout,
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
