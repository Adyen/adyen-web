import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError, handleOrderRequest, showAuthorised } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
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

    // console.log('env env', process.env.__CLIENT_ENV__);
    // console.log('env key', process.env.__CLIENT_KEY__);
    const checkout = await AdyenCheckout({
        environment: process.env.__CLIENT_ENV__,
        // environmentUrls: {
        //     api: process.env.__CLIENT_ENV__
        // },
        analytics: {
            enabled: false
        },
        amount: successTestAmount,
        session,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        showPayButton: false,
        //onSubmit: handleSubmit,
        //onOrderRequest: handleOrderRequest,
        //onAdditionalDetails: handleAdditionalDetails,
        onOrderCreated: data => {
            console.log('=== onOrderCreated ===', data);

            window.paymentMethod = checkout.create('card').mount('.ancv-field');
        },
        onPaymentCompleted: () => {
            showAuthorised();
        },
        onError: handleError,
        paymentMethodsConfiguration: {
            ideal: {
                highlightedIssuers: ['1121', '1154', '1153']
            }
        }
        // ...window.mainConfiguration
    });

    window.paymentMethod = checkout.create('ancv').mount('.ancv-field');

    document.querySelector('#ancv-pay-button').addEventListener('click', () => {
        window.paymentMethod.submit();
    });
};

initCheckout();
