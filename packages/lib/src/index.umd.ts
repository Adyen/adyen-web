import { AdyenCheckout } from './AdyenCheckout';
import { NewableComponent } from './core/core.registry';
import * as components from './components';
import * as locales from './language/locales';

const Classes: NewableComponent[] = Object.keys(components).map(key => components[key]);

// Register all Components
AdyenCheckout.register(...Classes);

const AdyenWeb = {
    AdyenCheckout,
    ...components,
    ...locales
};

if (typeof window !== 'undefined') {
    if (!window.AdyenWeb) window.AdyenWeb = {};
    window.AdyenWeb = AdyenWeb;
}
