import { AdyenCheckout, Giftcard, MealVoucherFR, Card, fr_FR } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { handleChange, handleOnPaymentCompleted, handleOnPaymentFailed, handleSubmit } from '../../handlers';
import { amount, shopperLocale, countryCode, returnUrl, shopperReference, environmentUrlsOverride } from '../../config/commonConfig';
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
        ...environmentUrlsOverride,
        onChange: handleChange,
        onSubmit: handleSubmit,
        onPaymentCompleted: handleOnPaymentCompleted,
        onPaymentFailed: handleOnPaymentFailed,
        showPayButton: true,
        amount
    });

    window.giftcard = new Giftcard(window.checkout, {
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
    }).mount('#genericgiftcard-container');

    window.giftcard = new MealVoucherFR(window.checkout, {
        type: 'mealVoucher_FR_natixis',
        brand: 'mealVoucher_FR_natixis',
        onBalanceCheck: async (resolve, reject, data) => {
            resolve(await checkBalance(data));
        },
        onOrderRequest: async (resolve, reject) => {
            resolve(await createOrder({ amount }));
        }
    }).mount('#mealvoucher-fr-container');

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
        showPayButton: false,
        ...environmentUrlsOverride,

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onPaymentCompleted(result, element) {
            console.log('onPaymentCompleted', result, element);
        },
        onPaymentFailed(result, element) {
            console.log('onPaymentFailed', result, element);
        },
        onError: (error, component) => {
            console.error(error.message, component);
        }
    });

    const giftcardSubmitButton = document.querySelector('#custom-checkout-confirm-button');
    const checkoutCardButton = document.querySelector('#custom-checkout-card-button');

    const giftcardSubmit = () => window.giftcard.submit();
    const cardSubmit = () => window.card.submit();

    giftcardSubmitButton.addEventListener('click', giftcardSubmit);
    checkoutCardButton.addEventListener('click', cardSubmit);

    window.giftcard = new Giftcard(sessionCheckout, {
        type: 'giftcard',
        brand: 'svs',
        onOrderUpdated: () => {
            console.log('onOrderUpdated');
        },
        onRequiringConfirmation: (resolve, reject) => {
            checkoutCardButton.removeEventListener('click', cardSubmit);
            checkoutCardButton.add('click', () => resolve());
        }
    }).mount('#giftcard-session-container');

    window.card = new Card(sessionCheckout).mount('#payment-method-container');
})();
