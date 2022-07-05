import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, countryCode, returnUrl, shopperReference } from '../../services/commonConfig';
import '../../style.scss';

const initCheckout = async () => {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
        countryCode,
    });

    const sessionCheckout = await AdyenCheckout({
        environment: 'test',
        clientKey: process.env.__CLIENT_KEY__,
        showPayButton: true,
        session,

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onPaymentCompleted: (result, component) => {
            console.info(result, component);
        },
        onError: (error, component) => {
            console.log('arg', error);
            console.error(error.message, component);
        },
    });

    window.card = sessionCheckout
        .create('giftcard', {
            type: 'giftcard',
            brand: 'valuelink',
            onOrderCreated: async (resolve, reject, data) => {
                window.onOrderCreatedTestData = data;
                resolve();
            }
        })
        .mount('.card-field');
};

initCheckout();
