import { AdyenCheckout, components } from './index';

AdyenCheckout.register(...components);

if (typeof window !== 'undefined') {
    // @ts-ignore Assign instance to window
    window.AdyenCheckout = AdyenCheckout;
}

export default AdyenCheckout;
