import Core from './core';
import type { CoreConfiguration, ICore } from './types';
import type { IUIElement } from '../components/internal/UIElement/types';

async function AdyenCheckout(props: CoreConfiguration): Promise<Core> {
    const checkout = new Core(props);
    return await checkout.initialize();
}

AdyenCheckout.register = (...items: (new (checkout: ICore, props) => IUIElement)[]) => {
    Core.register(...items);
};

/**
 * Function used by the 'auto' package to insert its bundle type information in the Core.
 * We can't inject its bundle type when bundling with Rollup (as done with the other bundle types), since 'auto' uses ES-LEGACY bundle type under the hood.
 */
AdyenCheckout.setBundleType = (type: string) => {
    Core.setBundleType(type);
};

export { AdyenCheckout };
