if (process.env.NODE_ENV === 'development') {
    require('preact/debug');
}

import { CoreOptions } from './core/types';
import Checkout from './core';
import UIElement from './components/UIElement';

async function AdyenCheckout(props: CoreOptions): Promise<Checkout> {
    const checkout = new Checkout(props);
    return await checkout.initialize();
}

AdyenCheckout.register = <T extends UIElement>(...items: (new (props) => T)[]) => {
    Checkout.register(...items);
};

export { AdyenCheckout };
