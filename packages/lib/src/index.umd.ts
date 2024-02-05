import { AdyenCheckout } from './core/AdyenCheckout';
import { NewableComponent } from './core/core.registry';
import * as components from './components';
import * as locales from './language/locales';
import createComponent from './create-component.umd';

const { Dropin, ...Components } = components;
const Classes: NewableComponent[] = Object.keys(Components).map(key => Components[key]);

// Register all Components
AdyenCheckout.register(...Classes);

const AdyenWeb = {
    AdyenCheckout,
    createComponent,
    ...components,
    ...locales
};

if (typeof window !== 'undefined') {
    if (!window.AdyenWeb) window.AdyenWeb = {};
    window.AdyenWeb = AdyenWeb;
}
