// if (process.env.NODE_ENV === 'development') {
//     require('preact/debug');
// }

import { CoreOptions } from './core/types';
import Checkout from './core';

async function AdyenCheckout(props: CoreOptions): Promise<Checkout> {
    const checkout = new Checkout(props);
    return await checkout.initialize();
}

export { AdyenCheckout };
