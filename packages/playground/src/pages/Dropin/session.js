import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, shopperReference, countryCode, returnUrl } from '../../config/commonConfig';

export async function initSession() {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
        countryCode,
        shopperEmail: 'guilherme.ribeiro-ctp1@adyen.com',
        telephoneNumber: '+31633958357',
        allowedPaymentMethods: ['scheme']
    });

    const checkout = await AdyenCheckout({
        allowedPaymentMethods: ['scheme'],
        environment: process.env.__CLIENT_ENV__,
        clientKey: process.env.__CLIENT_KEY__,
        session,

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onPaymentCompleted: (result, component) => {
            console.info(result, component);
        },
        onError: (error, component) => {
            console.error(error.message, component);
        },
        paymentMethodsConfiguration: {
            paywithgoogle: {
                buttonType: 'plain'
            },
            card: {
                // hasHolderName: true,
                // holderNameRequired: true,
                // holderName: 'J. Smith',
                // positionHolderNameOnTop: true,

                // billingAddress config:
                // billingAddressRequired: true,
                // billingAddressMode: 'partial',

                clickToPayConfiguration: {
                    schemes: {
                        discovery: '',
                        visa: {
                            srciTransactionId: 'adyen-id-' + new Date().getTime(),
                            srcInitiatorId: 'B9SECVKIQX2SOBQ6J9X721dVBBKHhJJl1nxxVbemHGn5oB6S8',
                            srciDpaId: '8e6e347c-254e-863f-0e6a-196bf2d9df02',
                            dpaTransactionOptions: {
                                dpaLocale: 'en_US',
                                payloadTypeIndicator: 'NON_PAYMENT'
                            }
                        },
                        mc: {
                            srcInitiatorId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1',
                            srciDpaId: '6d41d4d6-45b1-42c3-a5d0-a28c0e69d4b1_dpa2',
                            srciTransactionId: 'adyen-id-' + new Date().getTime(),
                            dpaTransactionOptions: {
                                dpaLocale: 'en_US',
                                paymentOptions: {
                                    dynamicDataType: 'CARD_APPLICATION_CRYPTOGRAM_SHORT_FORM'
                                },
                                consumerNameRequested: true
                            }
                        }
                    },
                    shopperIdentity: {
                        value: 'guilherme.ribeiro-ctp31@adyen.com',
                        // value: 'guilherme-visaclicktopay1@adyen.com',
                        type: 'email'
                    }
                    // shopperIdentity: {
                    //     value: '+31633958357',
                    //     // value: 'guilherme-visaclicktopay1@adyen.com',
                    //     type: 'mobilePhone'
                    // }
                }
            }
        }
    });

    const dropin = checkout.create('dropin').mount('#dropin-container');
    return [checkout, dropin];
}
