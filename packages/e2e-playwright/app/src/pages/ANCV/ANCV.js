import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleError, showAuthorised } from '../../handlers';
import { shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';
import { createSession } from '../../services';

const initCheckout = async () => {
    const successTestAmount = { currency: 'EUR', value: 2000 };

    const session = await createSession({
        amount: successTestAmount,
        shopperLocale,
        countryCode,
        reference: 'mock-playwright',
        returnUrl: 'http://localhost:3024/'
    });

    const checkout = await AdyenCheckout({
        environment: process.env.__CLIENT_ENV__,
        analytics: {
            enabled: false
        },
        amount: successTestAmount,
        session,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        showPayButton: true,

        onOrderCreated: data => {
            console.log('hello');
            showAuthorised('Partially Authorised');
        },
        onError: handleError
    });

    window.paymentMethod = checkout.create('ancv').mount('.ancv-field');
};

initCheckout();
