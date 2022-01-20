import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { checkBalance, createOrder } from '../../services';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';

const initCheckout = async () => {
    window.checkout = await AdyenCheckout({
        amount,
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        countryCode,
        environment: 'test',
        showPayButton: true,
        onSubmit: handleSubmit,
        onAdditionalDetails: handleAdditionalDetails,
        onError: handleError,
        ...window.mainConfiguration
    });

    // Credit card with installments
    window.card = checkout;
    checkout
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
        .mount('.card-field');
};

initCheckout();
