import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleChange, handleSubmit } from '../../handlers';
import { amount, shopperLocale, countryCode, returnUrl, shopperReference } from '../../config/commonConfig';
import { checkBalance, createOrder, createSession } from '../../services';
import '../../../config/polyfills';
import '../../utils';
import '../../style.scss';

(async () => {
    window.checkout = await AdyenCheckout({
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        environment: process.env.__CLIENT_ENV__,
        onChange: handleChange,
        onSubmit: handleSubmit,
        showPayButton: true,
        amount
    });

    window.giftcard = checkout
        .create('giftcard', {
            type: 'giftcard',
            brand: 'valuelink',
            onBalanceCheck: async (resolve, reject, data) => {
                resolve(await checkBalance(data));
            },
            onOrderRequest: async (resolve, reject) => {
                resolve(await createOrder({ amount }));
            }
        })
        .mount('#genericgiftcard-container');

    window.giftcard = checkout
        .create('mealVoucher_FR_natixis', {
            type: 'mealVoucher_FR_natixis',
            brand: 'mealVoucher_FR_natixis',
            onBalanceCheck: async (resolve, reject, data) => {
                resolve(await checkBalance(data));
            },
            onOrderRequest: async (resolve, reject) => {
                resolve(await createOrder({ amount }));
            }
        })
        .mount('#mealvoucher-fr-container');

    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
        countryCode
    });

    const sessionCheckout = await AdyenCheckout({
        environment: process.env.__CLIENT_ENV__,
        clientKey: process.env.__CLIENT_KEY__,
        session,
        showPayButton: true,

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onPaymentCompleted: (result, component) => {
            console.info(result, component);
        },
        onError: (error, component) => {
            console.error(error.message, component);
        }
    });

    window.giftcard = sessionCheckout
        .create('giftcard', {
            type: 'giftcard',
            brand: 'svs',
            onOrderCreated: (data) => {
                afterGiftCard(data);
            }
        })
        .mount('#giftcard-session-container');


    const afterGiftCard = (order) => {
        sessionCheckout.create('card').mount('#payment-method-container');
    }
})();
