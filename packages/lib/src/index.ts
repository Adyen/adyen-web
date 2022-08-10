/*eslint-disable */
if (process.env.NODE_ENV === 'development') {
    // Must use require here as import statements are only allowed
    // to exist at the top of a file.
    // require('preact/debug');
}

import { CoreOptions } from 'src/core/types';
import Checkout from './core';
/* eslint-enable */

async function AdyenCheckout(props: CoreOptions): Promise<Checkout> {
    const checkout = new Checkout(props);
    return await checkout.initialize();
}

export default AdyenCheckout;
