import { AdyenCheckout, Dropin, Card, WeChat, Giftcard, PayPal, Ach, GooglePay, en_US } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, shopperReference, countryCode, returnUrl } from '../../config/commonConfig';

export async function initSession() {
    // Not all txVariants are registered
    AdyenCheckout.register(Dropin, Card, PayPal, Ach, GooglePay, WeChat, Giftcard);

    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale: 'en-US',
        shopperReference,
        telephoneNumber: '+611223344',
        shopperEmail: 'shopper.ctp1@adyen.com',
        countryCode
    });

    const checkout = await AdyenCheckout({
        environment: process.env.__CLIENT_ENV__,
        clientKey: process.env.__CLIENT_KEY__,

        session,

        locale: en_US,

        translations: {
            'en-US': {
                payButton: 'Caralho'
            }
        },

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
