import Checkout from './index';
import type { CoreConfiguration, ICore } from './types';
import type { IUIElement } from '../components/internal/UIElement/types';

async function AdyenCheckout(props: CoreConfiguration): Promise<Checkout> {
    const checkout = new Checkout(props);
    return await checkout.initialize();
}

AdyenCheckout.register = (...items: (new (checkout: ICore, props) => IUIElement)[]) => {
    Checkout.register(...items);
};

export { AdyenCheckout };
