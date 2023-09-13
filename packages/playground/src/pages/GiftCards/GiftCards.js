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
            // placeholders: {
            //     cardNumber: 'ph enter NUM',
            //     securityCode: 'ph pin'
            // }
        })
        .mount('#genericgiftcard-container');
    return;
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
        reference: 'antonio_giftcard_test',
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

    const checkoutAddButton = document.querySelector('#custom-checkout-add-button');
    const checkoutConfirmButton = document.querySelector('#custom-checkout-confirm-button');
    const checkoutCardButton = document.querySelector('#custom-checkout-card-button');

    checkoutConfirmButton.style.display = 'none';

    const giftcardCheckBalance = () => window.giftcard.balanceCheck();
    const giftcardSubmit = () => window.giftcard.submit();
    const cardSubmit = () => window.card.submit();

    checkoutAddButton.addEventListener('click', giftcardCheckBalance);
    checkoutConfirmButton.addEventListener('click', giftcardSubmit);
    checkoutCardButton.addEventListener('click', cardSubmit);

    window.giftcard = sessionCheckout
        .create('giftcard', {
            type: 'giftcard',
            brand: 'svs',
            onOrderCreated: () => {
                console.log('onOrderCreated');
            },
            onRequiringConfirmation: () => {
                console.log('onRequiringConfirmation');
                checkoutConfirmButton.style.display = '';
                checkoutAddButton.style.display = 'none';
            }
        })
        .mount('#giftcard-session-container');

    window.card = sessionCheckout.create('card').mount('#payment-method-container');
})();
