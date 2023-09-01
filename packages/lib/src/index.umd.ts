import { AdyenCheckout, components } from './index';
import * as elements from './components';

AdyenCheckout.register(...components);

const checkout = {
    AdyenCheckout,
    ...elements
};

if (typeof window !== 'undefined') {
    if (!window.AdyenWeb) window.AdyenWeb = {};
    window.AdyenWeb = checkout;
}
