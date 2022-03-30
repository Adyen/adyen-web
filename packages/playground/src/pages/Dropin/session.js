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
            }
            // atome: {
            //     data: {
            //         personalDetails: {
            //             firstName: 'Jan',
            //             lastName: 'Jansen',
            //             telephoneNumber: '80002018'
            //         },
            //         billingAddress: {
            //             postalCode: '803022',
            //             street: 'Silver Cloud Lane'
            //         }
            //     }
            // }
        }
    });

    const dropin = checkout
        .create('dropin', {
            instantPaymentTypes: ['paywithgoogle']
        })
        .mount('#dropin-container');
    return [checkout, dropin];
}
