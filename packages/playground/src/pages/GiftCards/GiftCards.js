import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { handleChange, handleSubmit } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../config/commonConfig';
import { checkBalance, createOrder } from '../../services';
import '../../../config/polyfills';
import '../../utils';
import '../../style.scss';

window.checkout = new AdyenCheckout({
    locale: shopperLocale,
    countryCode,
    environment: 'test',
    clientKey: process.env.__CLIENT_KEY__,
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
