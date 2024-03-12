import { AdyenCheckout, Dropin, Card, WeChat, Giftcard, PayPal, Ach, GooglePay, Ideal } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { createSession, patchPaypalOrder } from '../../services';
import { amount, shopperLocale, shopperReference, countryCode, returnUrl } from '../../config/commonConfig';
import getTranslationFile from '../../config/getTranslation';
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
        translationFile: getTranslationFile(shopperLocale),

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onError: (error, component) => {
            console.error('error', JSON.stringify(error.name), JSON.stringify(error.message), component);
        },
        onChange: (state, component) => {
            console.log('onChange', state);
        },
        onPaymentCompleted: handleOnPaymentCompleted,
        onPaymentFailed: handleOnPaymentFailed
    });

    const dropin = new Dropin(checkout, {
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
            },
            ideal: {
                highlightedIssuers: ['1121', '1154', '1152']
            }
        }
    }).mount('#dropin-container');
    return [checkout, dropin];
}
