/*eslint-disable */
if (process.env.NODE_ENV === 'development') {
    // Must use require here as import statements are only allowed
    // to exist at the top of a file.
    // require('preact/debug');
}

import Checkout from './core';
/* eslint-enable */

async function AdyenCheckout(props) {
    const checkout = new Checkout(props);
    return await checkout.initialize();
}

export default AdyenCheckout;
