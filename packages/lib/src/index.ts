import * as components from './components';
import * as locales from './language/locales';
import { AdyenCheckout } from './AdyenCheckout';

const AdyenWeb = {
    ...components,
    ...locales,
    AdyenCheckout
};
export default AdyenWeb;

export { components };
export * from './components';
export * from './language/locales';
export * from './AdyenCheckout';
