// if (process.env.NODE_ENV === 'development') {
//     require('preact/debug');
// }

import { CoreOptions } from './core/types';
import Checkout from './core';
import UIElement from './components/UIElement';

async function AdyenCheckout(props: CoreOptions): Promise<Checkout> {
    const checkout = new Checkout(props);
    return await checkout.initialize();
}

// this might break tree shaking? to be checked
AdyenCheckout.register = (...items: (typeof UIElement)[]) => {
    Checkout.register(...items);
};

export { AdyenCheckout };
