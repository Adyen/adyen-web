import { AdyenCheckout, Dropin, Card, WeChat, Giftcard, PayPal, Ach, GooglePay, Riverty, Bancontact, Klarna } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, shopperReference, countryCode, returnUrl, environmentUrlsOverride } from '../../config/commonConfig';
import { handleOnPaymentCompleted, handleOnPaymentFailed } from '../../handlers';

export async function initSession() {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
        telephoneNumber: '+611223344',
        shopperEmail: 'shopper.email@adyen.com',
        countryCode
    });

    const checkout = await AdyenCheckout({
        environment: process.env.__CLIENT_ENV__,
        clientKey: process.env.__CLIENT_KEY__,

        session,

        ...environmentUrlsOverride,

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onError: (error, component) => {
            console.log(error.name, error.message, error.cause);
        },
        onPaymentCompleted: handleOnPaymentCompleted,
        onPaymentFailed: handleOnPaymentFailed
    });

    const dropin = new Dropin(checkout, {
        instantPaymentTypes: ['googlepay'],
        paymentMethodComponents: [Card, WeChat, Giftcard, PayPal, Ach, GooglePay, Riverty, Bancontact, Klarna],
        paymentMethodsConfiguration: {
            googlepay: {
                buttonType: 'plain',
                buttonRadius: 20,
                onAuthorized(data, actions) {
                    console.log(data, actions);
                    actions.resolve();
                }
            },
            card: {
                hasHolderName: true,
                holderNameRequired: true,
                data: {
                    holderName: 'J. Smith'
                },
                _disableClickToPay: false
            },
            klarna: {
                useKlarnaWidget: true
            }
        }
    }).mount('#dropin-container');
    return [checkout, dropin];
}
