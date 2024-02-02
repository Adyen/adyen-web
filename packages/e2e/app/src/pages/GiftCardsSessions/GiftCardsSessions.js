import { AdyenCheckout, Giftcard } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
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
        countryCode
    });

    window.sessionCheckout = await AdyenCheckout({
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
        }
    });

    window.giftcard = new Giftcard(window.sessionCheckout, {
        type: 'giftcard',
        brand: 'valuelink',
        onOrderCreated: data => {
            window.onOrderCreatedTestData = data;
        },
        onRequiringConfirmation: () => {
            window.onRequiringConfirmationTestData = true;
        },
        brandsConfiguration: {
            genericgiftcard: {
                icon: 'https://checkoutshopper-test.adyen.com/checkoutshopper/images/logos/mc.svg',
                name: 'Gifty mcGiftface'
            }
        }
    }).mount('.card-field');
};

initCheckout();
