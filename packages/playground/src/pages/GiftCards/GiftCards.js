import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleChange, handleSubmit } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../config/commonConfig';
import { checkBalance, createOrder } from '../../services';
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
})();
