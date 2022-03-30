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
            atome: {
                data: {
                    personalDetails: {
                        firstName: 'Jan',
                        lastName: 'Jansen',
                        shopperEmail: 'shopper@testemail.com',
                        telephoneNumber: '+17203977880'
                    },
                    billingAddress: {
                        city: 'Boulder',
                        country: 'SG',
                        houseNumberOrName: '242',
                        postalCode: '803022',
                        stateOrProvince: 'CO',
                        street: 'Silver Cloud Lane'
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
