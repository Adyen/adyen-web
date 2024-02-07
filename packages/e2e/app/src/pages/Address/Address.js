import { AdyenCheckout, Address } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import '../../style.scss';

const initCheckout = async () => {
    window.checkout = await AdyenCheckout();
    window.address = new Address(checkout).mount('.address-field');
};

initCheckout();
