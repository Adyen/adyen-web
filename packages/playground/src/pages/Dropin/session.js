import { AdyenCheckout, Dropin, Card, WeChat, Giftcard, PayPal, Ach, GooglePay, Riverty, Bancontact, Klarna } from '@adyen/adyen-web';
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
        shopperEmail: 'guilherme.ribeiro-ctp1@adyen.com',
        countryCode
    });

    const checkout = await AdyenCheckout({
        environment: process.env.__CLIENT_ENV__,
        clientKey: process.env.__CLIENT_KEY__,

        session,

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
                configuration: {
                    visaSrciDpaId: '8e6e347c-254e-863f-0e6a-196bf2d9df02',
                    visaSrcInitiatorId: 'B9SECVKIQX2SOBQ6J9X721dVBBKHhJJl1nxxVbemHGn5oB6S8',
                    mcDpaId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1_dpa2',
                    mcSrcClientId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1'
                },
                hasHolderName: true,
                holderNameRequired: true,
                data: {
                    holderName: 'J. Smith'
                }
            },
            klarna: {
                useKlarnaWidget: true
            }
        }
    }).mount('#dropin-container');
    return [checkout, dropin];
}
