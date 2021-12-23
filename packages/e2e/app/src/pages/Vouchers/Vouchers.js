import AdyenCheckout from '@adyen/adyen-web/dist/es';
import '@adyen/adyen-web/dist/es/adyen.css';
import { shopperLocale } from '../../services/commonConfig';
import '../../style.scss';

const initCheckout = async () => {
    window.checkout = await AdyenCheckout({
        clientKey: process.env.__CLIENT_KEY__,
        locale: shopperLocale,
        environment: 'test'
    });

    // Boleto Input
    window.boletoInput = checkout
        .create('boletobancario', {
            ...window.boletoConfig
        })
        .mount('#boleto-input-container');
};

initCheckout();
