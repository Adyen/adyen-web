import { AdyenCheckout, components } from './index';
import * as elements from './components';

AdyenCheckout.register(...components);

const checkout = {
    AdyenCheckout,
    ...elements
};

if (typeof window !== 'undefined') {
    if (!window.adyen) window.adyen = {};
    window.adyen.checkout = checkout;
}

export default checkout;
