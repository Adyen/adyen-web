import { AdyenCheckout, Giftcard, MealVoucherFR } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { handleChange, handleSubmit } from '../../handlers';
import { amount, shopperLocale, countryCode, returnUrl, shopperReference } from '../../config/commonConfig';
import { checkBalance, createOrder, createSession } from '../../services';
import '../../../config/polyfills';
import '../../utils';
import '../../style.scss';

(async () => {
    AdyenCheckout.register(Giftcard, MealVoucherFR);

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

    window.giftcard = new Giftcard({
        core: window.checkout,
        type: 'giftcard',
        brand: 'valuelink',
        onBalanceCheck: async (resolve, reject, data) => {
            resolve(await checkBalance(data));
        },
        onOrderRequest: async (resolve, reject) => {
            resolve(await createOrder({ amount }));
        }
    }).mount('#genericgiftcard-container');

    window.giftcard = new Giftcard({
        core: window.checkout,
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

    window.giftcard = new Giftcard({
        core: sessionCheckout,
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
    }).mount('#giftcard-session-container');

    window.card = new Card({ core: sessionCheckout }).mount('#payment-method-container');
})();
