import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale, countryCode } from '../../services/commonConfig';
import '../../style.scss';

window.checkout = new AdyenCheckout({
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
window.card = checkout
    .create('card', {
        brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc'],
        ...window.cardConfig
    })
    .mount('.card-field');
