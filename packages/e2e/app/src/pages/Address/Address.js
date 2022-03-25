import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import '../../style.scss';

const initCheckout = async () => {
    window.checkout = await AdyenCheckout();
    window.address = checkout.create('address').mount('.address-field');
};

initCheckout();
