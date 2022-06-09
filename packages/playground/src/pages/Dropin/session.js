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
                            srcInitiatorId: 'xxxxxxxx',
                            srciDpaId: 'xxxxxxxx',
                            dpaTransactionOptions: {
                                dpaLocale: 'en_US',
                                payloadTypeIndicator: 'NON_PAYMENT'
                            }
                        },
                        mc: {
                            srcInitiatorId: 'xxxxxxxx',
                            srciDpaId: 'xxxxxxxx',
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
                        // value: 'guilherme.ribeiro-visaclicktopay1@adyen.com', // WITH LEONARD PHONE
                        value: 'guilherme.ribeiro-ctp1@adyen.com',
                        // value: 'maximilian.maldacker-ctp2@adyen.com',
                        // value: 'guilherme-visaclicktopay1@adyen.com',
                        type: 'email'
                    }
                }
            }
        }
    });

    const dropin = checkout
        .create('dropin', {
            instantPaymentTypes: ['paywithgoogle']
        })
        .mount('#dropin-container');
    return [checkout, dropin];
}
