import { CoreOptions } from './core/types';
import Checkout from './core';
import UIElement from './components/UIElement';

async function AdyenCheckout(props: CoreOptions): Promise<Checkout> {
    const checkout = new Checkout(props);
    return await checkout.initialize();
}

AdyenCheckout.register = (...items: (new (props) => UIElement)[]) => {
    Checkout.register(...items);
};

export { AdyenCheckout };
