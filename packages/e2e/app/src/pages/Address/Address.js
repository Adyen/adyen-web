import { AdyenCheckout, Address } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import '../../style.scss';
import { countryCode } from '../../services/commonConfig';

const initCheckout = async () => {
    window.checkout = await AdyenCheckout({
        countryCode,
        _environmentUrls: {
            cdn: {
                translations: '/'
            }
        }
    });
    window.address = new Address(checkout).mount('.address-field');
};

initCheckout();
