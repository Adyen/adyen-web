import { AdyenCheckout, Dropin, Card, WeChat, Giftcard, PayPal, Ach, GooglePay, Ideal } from '@adyen/adyen-web';
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
        translationFile: getTranslationFile(shopperLocale),

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onPaymentCompleted: (result, component) => {
            console.info('onPaymentCompleted', result, component);
        },
        onPaymentFailed(result, element) {
            console.log('onPaymentFailed', result, element);
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
        paymentMethodComponents: [Card, WeChat, Giftcard, PayPal, Ach, GooglePay, Ideal],
        paymentMethodsConfiguration: {
            googlepay: {
                buttonType: 'plain',

                onAuthorized(data, actions) {
                    console.log(data, actions);
                    actions.reject();
                }
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
