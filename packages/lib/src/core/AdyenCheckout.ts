import { CoreConfiguration } from './types';
import Checkout from './index';
import UIElement from '../components/internal/UIElement';

async function AdyenCheckout(props: CoreConfiguration): Promise<Checkout> {
    const checkout = new Checkout(props);
    return await checkout.initialize();
}

AdyenCheckout.register = (...items: (new (props) => UIElement)[]) => {
    Checkout.register(...items);
};

export { AdyenCheckout };
